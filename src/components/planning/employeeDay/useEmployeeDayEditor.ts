import { minutesToTime } from "@recyclerie/api/domain/timeRange";
import type { EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import { useEffect, useMemo, useRef, useState } from "react";
import { addEmployeeToTask, removeEmployeeFromTask } from "../../../services/api/tasks";
import { useRevertingWriteQueue } from "../useRevertingWriteQueue";
import { deriveDayRows, seedDayRanges, type DayRange, type EmployeeDayRow } from "./localDay";

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
  const setRangesTracked = (next: DayRange[] | ((previous: DayRange[]) => DayRange[])) => {
    setRanges((previous) => {
      const value = typeof next === "function" ? next(previous) : next;
      rangesRef.current = value;
      return value;
    });
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

  /** Assigns the Employee to an `assignable` Task, on its first free window. */
  const assignTask = (taskId: number) => {
    if (!day) return;
    const row = deriveDayRows(day, rangesRef.current).find((candidate) => candidate.task.id === taskId);
    const free = row?.status === "assignable" ? row.freeWindows[0] : undefined;
    if (!free) return;

    hasChangesRef.current = true;
    const key = `local-${nextLocalId.current++}`;
    setRangesTracked((previous) => [
      ...previous,
      { key, id: null, employeeId, taskId, start: free.start, end: free.end },
    ]);
    enqueueWrite(() => {
      const current = rangesRef.current.find((range) => range.key === key);
      if (!current) return Promise.resolve(); // unassigned again before this write ran
      return runWrite(
        () =>
          addEmployeeToTask(taskId, employeeId, {
            start_time: minutesToTime(current.start),
            end_time: minutesToTime(current.end),
          }),
        "Erreur lors de l'assignation",
        (response) => {
          serverHeldRef.current.add(taskId);
          const created = response.data.data;
          setRangesTracked((previous) =>
            previous.map((range) => (range.key === key ? { ...range, id: created.id } : range)),
          );
        },
      );
    });
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

  return { ready, rows, ranges, assignTask, unassignTask, finish };
}
