import { minutesToTime, type MinuteWindow } from "@recyclerie/api/domain/timeRange";
import type { EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TimeRangeDto } from "@recyclerie/api/responses/timeRanges";
import {
  addEmployeeToTask,
  createTimeRange,
  deleteTimeRange,
  removeEmployeeFromTask,
  updateTimeRange,
} from "../../../services/api/tasks";
import { useRevertingWriteQueue } from "../useRevertingWriteQueue";
import { deriveDayRows, seedDayRanges, type DayRange, type EmployeeDayRow } from "./localDay";

/** How long to wait after the last drag tick before sending a Time range's new position. */
const RANGE_WRITE_DEBOUNCE_MS = 400;

interface UseEmployeeDayEditorOptions {
  employeeId: number;
  /** The server's day (the query's data); `undefined` while it loads. */
  day: EmployeeTasksDayDto | undefined;
  /** True while the day is being (re)fetched: cached data may then be stale, so it is not used yet. */
  isFetching: boolean;
  /** Each time the dialog opens, local state is seeded again from the server. */
  open: boolean;
  /** Refetches the day; resolves with the server's current state. */
  refetchDay: () => Promise<EmployeeTasksDayDto | undefined>;
}

/**
 * Local state and writes of the Employee day dialog, the mirror image of what
 * `TaskAssignmentDialog` does for one Task: the UI follows local state at once, the writes
 * go through the shared serial write queue and the existing task endpoints, and a refused
 * write reverts local state to the server's (refetched) day with an error toast.
 *
 * Local state is the Employee's Time ranges of the day (`DayRange`, one list for all Tasks);
 * `rows` re-derives every Task's status from it (`deriveDayRows`). It is seeded once per
 * opening, after the day has settled, so a background refetch never stomps on an edit.
 */
export function useEmployeeDayEditor({ employeeId, day, isFetching, open, refetchDay }: UseEmployeeDayEditorOptions) {
  const [ranges, setRanges] = useState<DayRange[]>([]);
  const rangesRef = useRef<DayRange[]>([]);
  /**
   * Replaces local state, and `rangesRef` with it at once: queued writes read the ref, and
   * must see a change (such as the id a create call just returned) as soon as it is made,
   * not whenever React gets to render it.
   */
  const setRangesTracked = (next: DayRange[] | ((previous: DayRange[]) => DayRange[])) => {
    const value = typeof next === "function" ? next(rangesRef.current) : next;
    rangesRef.current = value;
    setRanges(value);
  };

  // `session` counts the openings; `seededSession` is the one local state was last seeded for.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((current) => current + 1);
  }
  const [seededSession, setSeededSession] = useState<number | null>(null);
  const ready = seededSession === session;

  /** Tasks on which the server holds a Time range of the Employee, as far as this dialog knows. */
  const serverHeldRef = useRef<Set<number>>(new Set());
  /** Bumped by every revert: writes queued before it describe local state that was just discarded. */
  const epochRef = useRef(0);

  const seedFromServer = (serverDay: EmployeeTasksDayDto) => {
    const seeded = seedDayRanges(serverDay);
    serverHeldRef.current = new Set(seeded.map((range) => range.taskId));
    setRangesTracked(seeded);
  };

  useEffect(() => {
    // Wait for the fetch to settle: on reopening, react-query hands back the stale cached
    // day while it refetches, and seeding from it would ignore the fresh one.
    if (open && day && !isFetching && !ready) {
      seedFromServer(day);
      setSeededSession(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, day, isFetching, ready, session]);

  const revertToServer = async () => {
    const serverDay = await refetchDay();
    if (serverDay) seedFromServer(serverDay);
    epochRef.current += 1;
  };
  const { writeQueue, runWrite, hasChangesRef } = useRevertingWriteQueue(revertToServer);
  const nextLocalId = useRef(0);

  /** Queues a write unless a revert happened since it was requested (its local effect is gone). */
  const enqueueWrite = (write: () => Promise<void>) => {
    const epoch = epochRef.current;
    writeQueue.enqueue(() => (epoch === epochRef.current ? write() : Promise.resolve()));
  };

  const rows: EmployeeDayRow[] = useMemo(() => (day && ready ? deriveDayRows(day, ranges) : []), [day, ready, ranges]);

  /** Keys of ranges removed locally before their create call came back: deleted as soon as it does. */
  const pendingRemovalRef = useRef<Set<string>>(new Set());

  const enqueueDelete = (taskId: number, rangeId: number) => {
    enqueueWrite(() =>
      runWrite(
        () => deleteTimeRange(taskId, employeeId, rangeId),
        "Erreur lors de la suppression de la plage horaire",
      ),
    );
  };

  /**
   * Shared by assigning and adding a range: both create a Time range from its latest locally
   * known position, then give the local placeholder the server's id (or delete the range right
   * back out when it was removed locally in the meantime).
   */
  const createRangeAndSettle = (
    taskId: number,
    key: string,
    request: (range: { start_time: TimeRangeDto["start_time"]; end_time: TimeRangeDto["end_time"] }) => Promise<{
      data: { data: TimeRangeDto };
    }>,
    errorMessage: string,
  ) => {
    enqueueWrite(() => {
      const current = rangesRef.current.find((range) => range.key === key);
      if (!current) return Promise.resolve(); // removed (or its Task unassigned) before this write ran
      return runWrite(
        () => request({ start_time: minutesToTime(current.start), end_time: minutesToTime(current.end) }),
        errorMessage,
        (response) => {
          serverHeldRef.current.add(taskId);
          const created = response.data.data;
          if (pendingRemovalRef.current.delete(key)) {
            enqueueDelete(taskId, created.id);
            return;
          }
          setRangesTracked((previous) =>
            previous.map((range) => (range.key === key ? { ...range, id: created.id } : range)),
          );
        },
      );
    });
  };

  /** Appends a local range, flagging the session as changed; returns its key. */
  const appendLocalRange = (taskId: number, window: MinuteWindow): string => {
    hasChangesRef.current = true;
    const key = `local-${nextLocalId.current++}`;
    setRangesTracked((previous) => [
      ...previous,
      { key, id: null, employeeId, taskId, start: window.start, end: window.end },
    ]);
    return key;
  };

  /** Assigns the Employee to an `assignable` Task, on its first free window. */
  const assignTask = (taskId: number) => {
    if (!day) return;
    const row = deriveDayRows(day, rangesRef.current).find((candidate) => candidate.task.id === taskId);
    const free = row?.status === "assignable" ? row.freeWindows[0] : undefined;
    if (!free) return;

    const key = appendLocalRange(taskId, free);
    createRangeAndSettle(
      taskId,
      key,
      (range) => addEmployeeToTask(taskId, employeeId, range),
      "Erreur lors de l'assignation",
    );
  };

  /** Adds a Time range to an `assigned` Task, on the first window the Employee has left there. */
  const addRange = (taskId: number) => {
    if (!day) return;
    const row = deriveDayRows(day, rangesRef.current).find((candidate) => candidate.task.id === taskId);
    const free = row?.status === "assigned" ? row.newRangeWindows[0] : undefined;
    if (!free) return;

    const key = appendLocalRange(taskId, free);
    createRangeAndSettle(
      taskId,
      key,
      (range) => createTimeRange(taskId, employeeId, range),
      "Erreur lors de l'ajout de la plage horaire",
    );
  };

  /** Removes one of several Time ranges of a Task; removing the last one is `unassignTask`. */
  const removeRange = (range: Pick<DayRange, "key">) => {
    const current = rangesRef.current.find((candidate) => candidate.key === range.key);
    if (!current) return;
    if (rangesRef.current.filter((candidate) => candidate.taskId === current.taskId).length < 2) return;

    hasChangesRef.current = true;
    writeQueue.cancel(current.key);
    setRangesTracked((previous) => previous.filter((candidate) => candidate.key !== current.key));
    if (current.id == null) {
      pendingRemovalRef.current.add(current.key); // its create has not come back yet
      return;
    }
    enqueueDelete(current.taskId, current.id);
  };

  /**
   * Moves a Time range: the dialog follows at once, one write per range is sent once the
   * dragging pauses. The caller keeps the range within its allowed windows (`rangeWindows`).
   */
  const updateRange = (range: Pick<DayRange, "key">, start: number, end: number) => {
    hasChangesRef.current = true;
    setRangesTracked((previous) =>
      previous.map((candidate) => (candidate.key === range.key ? { ...candidate, start, end } : candidate)),
    );
    const epoch = epochRef.current;
    writeQueue.scheduleDebounced(
      range.key,
      () => {
        const current = rangesRef.current.find((candidate) => candidate.key === range.key);
        // Gone, or a revert happened since this drag: the position it describes was discarded.
        // A range still without an id cannot get here: its create was queued first, so it has
        // settled (and given the range its id) before this write runs.
        if (!current || current.id == null || epoch !== epochRef.current) return Promise.resolve();
        return runWrite(
          () =>
            updateTimeRange(current.taskId, employeeId, current.id!, {
              start_time: minutesToTime(current.start),
              end_time: minutesToTime(current.end),
            }),
          "Erreur lors de la modification de la plage horaire",
        );
      },
      RANGE_WRITE_DEBOUNCE_MS,
    );
  };

  /** Removes the Employee from an `assigned` Task: all their Time ranges on it. */
  const unassignTask = (taskId: number) => {
    const held = rangesRef.current.filter((range) => range.taskId === taskId);
    if (held.length === 0) return;

    hasChangesRef.current = true;
    for (const range of held) writeQueue.cancel(range.key);
    setRangesTracked((previous) => previous.filter((range) => range.taskId !== taskId));
    enqueueWrite(() => {
      // Nothing to remove when the assignment this undoes never reached the server.
      if (!serverHeldRef.current.has(taskId)) return Promise.resolve();
      return runWrite(
        () => removeEmployeeFromTask(taskId, employeeId),
        "Erreur lors du retrait",
        () => {
          serverHeldRef.current.delete(taskId);
        },
      );
    });
  };

  /**
   * To call when the dialog closes: waits for the pending writes, then tells whether the
   * session changed anything (the page's caches are stale only then). Starts a new session.
   */
  const finish = async (): Promise<boolean> => {
    const changed = hasChangesRef.current;
    hasChangesRef.current = false;
    await writeQueue.flush();
    return changed;
  };

  return { ready, rows, ranges, assignTask, unassignTask, addRange, removeRange, updateRange, finish };
}
