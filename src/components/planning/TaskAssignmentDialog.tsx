import { Person, PersonAdd, PersonOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  firstFreeWindow,
  minutesToTime,
  timeToMinutes,
  type MinuteWindow,
} from "@recyclerie/api/domain/timeRange";
import { toIsoTime } from "@recyclerie/api/domain/date";
import type { TaskAssignedEmployeeDto } from "@recyclerie/api/responses/tasks";
import type { TaskAvailableEmployeeDto, TimeRangeDto } from "@recyclerie/api/responses/timeRanges";
import { getApiErrorMessage } from "../../utils/apiToastMessage";
import type { TaskModel } from "../../interfaces/Models";
import {
  addEmployeeToTask,
  createTimeRange,
  deleteTimeRange,
  getAvailableEmployeesForTask,
  getEmployeesForTask,
  removeEmployeeFromTask,
  updateTimeRange,
} from "../../services/api/tasks";
import { createTimeRangeWriteQueue, type TimeRangeWriteQueue } from "./timeRangeWriteQueue";
import { AssignedEmployeeRow } from "./taskAssignment/AssignedEmployeeRow";
import { AvailableEmployeeRow } from "./taskAssignment/AvailableEmployeeRow";
import { CoverageTimeline } from "./taskAssignment/CoverageTimeline";
import { TaskAssignmentDialogInfo, TaskAssignmentDialogTitle } from "./taskAssignment/DialogHeader";
import { otherLocalRangesForEmployee, toMinuteWindow, type EmployeeInfo, type LocalRange } from "./taskAssignment/geometry";
import { AssignedColumnLegend } from "./taskAssignment/Legend";
import { Loading } from "../Loading";

/** How long to wait after the last drag tick before sending a Time range's new position. */
const RANGE_WRITE_DEBOUNCE_MS = 400;

interface TaskAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  selectedTask: TaskModel;
  onAssignEmployee?: (employeeId: number) => void;
  onUnassignEmployee?: (employeeId: number) => void;
  onCloseWithChanges?: () => void;
}

const TaskAssignmentDialog = ({
  open,
  onClose,
  selectedTask,
  onAssignEmployee,
  onUnassignEmployee,
  onCloseWithChanges,
}: TaskAssignmentDialogProps) => {
  const taskId = selectedTask.id;

  const taskWindow: MinuteWindow = useMemo(
    () => ({
      start: timeToMinutes(toIsoTime(selectedTask.start_time)),
      end: timeToMinutes(toIsoTime(selectedTask.end_time)),
    }),
    [selectedTask.start_time, selectedTask.end_time],
  );

  const availableQuery = useQuery({
    queryKey: ["taskAvailableEmployees", taskId],
    queryFn: () => getAvailableEmployeesForTask(taskId).then((res) => res.data.data),
    enabled: open && !!taskId,
  });
  const assignedQuery = useQuery({
    queryKey: ["taskAssignedEmployees", taskId],
    queryFn: () => getEmployeesForTask(taskId).then((res) => res.data.data),
    enabled: open && !!taskId,
  });

  // Local state drives the UI; the queries above only seed it once and re-seed it
  // after a rejected write (`revertToServer`). Successful writes update `ranges`
  // directly so a background refetch never stomps on an in-flight edit.
  const [ranges, setRanges] = useState<LocalRange[]>([]);
  const rangesRef = useRef<LocalRange[]>([]);
  const setRangesTracked = (updater: LocalRange[] | ((prev: LocalRange[]) => LocalRange[])) => {
    setRanges((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      rangesRef.current = next;
      return next;
    });
  };

  const seedFromServer = (data: TaskAssignedEmployeeDto[]) => {
    setRangesTracked(
      data.flatMap((employee) =>
        employee.timeRanges.map((range) => ({
          key: `server-${range.id}`,
          id: range.id,
          employeeId: employee.id,
          start: timeToMinutes(range.start_time),
          end: timeToMinutes(range.end_time),
        })),
      ),
    );
  };

  const hasSeededRef = useRef(false);
  useEffect(() => {
    // Wait for the fetch to settle before seeding: on remount, react-query can
    // synchronously return a stale cached value (e.g. from before an employee
    // was assigned) while it refetches in the background. Seeding from that
    // stale snapshot would mark `hasSeededRef` done and ignore the fresh data.
    if (assignedQuery.data && !assignedQuery.isFetching && !hasSeededRef.current) {
      seedFromServer(assignedQuery.data);
      hasSeededRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedQuery.data, assignedQuery.isFetching]);

  const revertToServer = async () => {
    const result = await assignedQuery.refetch();
    await availableQuery.refetch();
    seedFromServer(result.data ?? []);
  };
  const revertToServerRef = useRef(revertToServer);
  revertToServerRef.current = revertToServer;

  const hasChangesRef = useRef(false);
  const pendingRemovalRef = useRef<Set<string>>(new Set());
  const nextLocalId = useRef(0);

  const writeQueueRef = useRef<TimeRangeWriteQueue | null>(null);
  if (!writeQueueRef.current) {
    writeQueueRef.current = createTimeRangeWriteQueue((error) => {
      void revertToServerRef.current();
      toast.error(getApiErrorMessage(error, "Erreur lors de l'enregistrement"));
    });
  }
  const writeQueue = writeQueueRef.current;

  useEffect(
    () => () => {
      void writeQueue.flush();
    },
    [writeQueue],
  );

  /** Runs a write; on rejection, reverts local state to the server's and toasts the error. */
  const runWrite = async <T,>(
    write: () => Promise<T>,
    errorMessage: string,
    onSuccess?: (result: T) => void,
  ) => {
    try {
      const result = await write();
      onSuccess?.(result);
    } catch (error) {
      await revertToServerRef.current();
      toast.error(getApiErrorMessage(error, errorMessage));
    }
  };

  const enqueueDelete = (employeeId: number, rangeId: number) => {
    writeQueue.enqueue(() =>
      runWrite(
        () => deleteTimeRange(taskId, employeeId, rangeId),
        "Erreur lors de la suppression de la plage horaire",
      ),
    );
  };

  /** Shared by assigning an Employee and adding a range: both create a Time range
   * from the latest locally-known position, then reconcile the local placeholder
   * with the server id (or delete it right back out if it was removed meanwhile). */
  const createRangeAndSettle = (
    employeeId: number,
    key: string,
    request: (range: {
      start_time: string;
      end_time: string;
    }) => Promise<{ data: { data: TimeRangeDto } }>,
    errorMessage: string,
    onCreated?: () => void,
  ) => {
    writeQueue.enqueue(() => {
      const current = rangesRef.current.find((range) => range.key === key);
      if (!current) return Promise.resolve();
      return runWrite(
        () =>
          request({
            start_time: minutesToTime(current.start),
            end_time: minutesToTime(current.end),
          }),
        errorMessage,
        (response) => {
          const created = response.data.data;
          if (pendingRemovalRef.current.delete(key)) {
            enqueueDelete(employeeId, created.id);
            return;
          }
          setRangesTracked((prev) =>
            prev.map((range) => (range.key === key ? { ...range, id: created.id } : range)),
          );
          onCreated?.();
        },
      );
    });
  };

  const employeeInfoById = useMemo(() => {
    const map = new Map<number, EmployeeInfo>();
    for (const employee of availableQuery.data ?? []) {
      map.set(employee.id, {
        id: employee.id,
        nom: employee.nom,
        prenom: employee.prenom,
        fullName: employee.fullName,
        workWindows: employee.workWindows,
        busyRanges: employee.busyRanges,
      });
    }
    for (const employee of assignedQuery.data ?? []) {
      if (!map.has(employee.id)) {
        map.set(employee.id, {
          id: employee.id,
          nom: employee.nom,
          prenom: employee.prenom,
          fullName: employee.fullName,
          workWindows: [],
          busyRanges: [],
        });
      }
    }
    return map;
  }, [availableQuery.data, assignedQuery.data]);

  const assignedEmployeeIds = useMemo(
    () => Array.from(new Set(ranges.map((range) => range.employeeId))),
    [ranges],
  );

  const availableToAssign = (availableQuery.data ?? []).filter(
    (employee) => !assignedEmployeeIds.includes(employee.id),
  );

  const assignEmployee = (employee: TaskAvailableEmployeeDto) => {
    const free = firstFreeWindow({
      task: taskWindow,
      workWindows: employee.workWindows.map(toMinuteWindow),
      otherRanges: employee.busyRanges.map(toMinuteWindow),
    });
    if (!free) return;
    hasChangesRef.current = true;
    const key = `local-${nextLocalId.current++}`;
    setRangesTracked((prev) => [
      ...prev,
      { key, id: null, employeeId: employee.id, start: free.start, end: free.end },
    ]);
    createRangeAndSettle(
      employee.id,
      key,
      (range) => addEmployeeToTask(taskId, employee.id, range),
      "Erreur lors de l'assignation",
      () => onAssignEmployee?.(employee.id),
    );
  };

  const unassignEmployee = (employeeId: number) => {
    hasChangesRef.current = true;
    for (const range of rangesRef.current.filter((range) => range.employeeId === employeeId)) {
      writeQueue.cancel(range.key);
    }
    setRangesTracked((prev) => prev.filter((range) => range.employeeId !== employeeId));
    writeQueue.enqueue(() =>
      runWrite(
        () => removeEmployeeFromTask(taskId, employeeId),
        "Erreur lors du retrait",
        () => onUnassignEmployee?.(employeeId),
      ),
    );
  };

  const addRange = (employeeId: number) => {
    const info = employeeInfoById.get(employeeId);
    if (!info) return;
    const free = firstFreeWindow({
      task: taskWindow,
      workWindows: info.workWindows.map(toMinuteWindow),
      otherRanges: [
        ...info.busyRanges.map(toMinuteWindow),
        ...otherLocalRangesForEmployee(rangesRef.current, employeeId),
      ],
    });
    if (!free) return;
    hasChangesRef.current = true;
    const key = `local-${nextLocalId.current++}`;
    setRangesTracked((prev) => [
      ...prev,
      { key, id: null, employeeId, start: free.start, end: free.end },
    ]);
    createRangeAndSettle(
      employeeId,
      key,
      (range) => createTimeRange(taskId, employeeId, range),
      "Erreur lors de l'ajout de la plage horaire",
    );
  };

  const removeRange = (range: LocalRange) => {
    hasChangesRef.current = true;
    writeQueue.cancel(range.key);
    setRangesTracked((prev) => prev.filter((item) => item.key !== range.key));
    if (range.id == null) {
      pendingRemovalRef.current.add(range.key);
      return;
    }
    enqueueDelete(range.employeeId, range.id);
  };

  const updateRange = (range: LocalRange, start: number, end: number) => {
    hasChangesRef.current = true;
    setRangesTracked((prev) =>
      prev.map((item) => (item.key === range.key ? { ...item, start, end } : item)),
    );
    writeQueue.scheduleDebounced(
      range.key,
      () => {
        const current = rangesRef.current.find((item) => item.key === range.key);
        if (!current || current.id == null) return Promise.resolve();
        return runWrite(
          () =>
            updateTimeRange(taskId, current.employeeId, current.id!, {
              start_time: minutesToTime(current.start),
              end_time: minutesToTime(current.end),
            }),
          "Erreur lors de la modification de la plage horaire",
        );
      },
      RANGE_WRITE_DEBOUNCE_MS,
    );
  };

  const handleClose = () => {
    void writeQueue.flush();
    if (hasChangesRef.current) onCloseWithChanges?.();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <TaskAssignmentDialogTitle
        taskName={selectedTask?.name}
        storeName={selectedTask?.Recyclery?.name ?? ""}
      />
      <DialogContent>
        <TaskAssignmentDialogInfo
          storeName={selectedTask?.Recyclery?.name ?? ""}
          scheduledDate={selectedTask?.scheduled_date ? String(selectedTask.scheduled_date) : ""}
        />

        <CoverageTimeline task={taskWindow} ranges={ranges} />

        <Loading isLoading={assignedQuery.isLoading || availableQuery.isLoading}>

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Person color="primary" />
                Employés assignés ({assignedEmployeeIds.length})
              </Typography>
              <AssignedColumnLegend />
              {assignedEmployeeIds.length > 0 ? (
                <Stack spacing={1.5}>
                  {assignedEmployeeIds.map((employeeId) => {
                    const info = employeeInfoById.get(employeeId);
                    if (!info) return null;
                    return (
                      <AssignedEmployeeRow
                        key={employeeId}
                        task={taskWindow}
                        info={info}
                        employeeRanges={ranges
                          .filter((range) => range.employeeId === employeeId)
                          .sort((a, b) => a.start - b.start)}
                        allRanges={ranges}
                        onUpdateRange={updateRange}
                        onAddRange={addRange}
                        onRemoveRange={removeRange}
                        onRemoveEmployee={unassignEmployee}
                      />
                    );
                  })}
                </Stack>
              ) : (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 3,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1,
                    border: "2px dashed #ccc",
                  }}
                >
                  <PersonOff sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Aucun employé assigné
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Cliquez sur "+" pour assigner des employés
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonAdd color="action" />
                Employés disponibles
              </Typography>
              {availableToAssign.length > 0 ? (

                <Box sx={{ maxHeight: 480, overflow: "auto" }}>
                  {availableToAssign.map((employee) => (
                    <AvailableEmployeeRow
                      key={employee.id}
                      task={taskWindow}
                      employee={employee}
                      onAssign={assignEmployee}
                    />
                  ))}
                </Box>
              ) :
                (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 3,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1,
                      border: "2px dashed #ccc",
                    }}
                  >
                    <PersonOff sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Aucun employé disponible
                    </Typography>

                  </Box>
                )}

            </Grid>
          </Grid>
        </Loading>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

TaskAssignmentDialog.Title = TaskAssignmentDialogTitle;
TaskAssignmentDialog.Info = TaskAssignmentDialogInfo;

export default TaskAssignmentDialog;
