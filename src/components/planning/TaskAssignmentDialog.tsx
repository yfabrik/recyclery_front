import {
  Add,
  AddCircleOutline,
  Block,
  CheckCircle,
  Delete,
  Person,
  PersonAdd,
  PersonOff,
  Store,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Slider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  assignableWindows,
  clampRangeToWindow,
  firstFreeWindow,
  minutesToTime,
  nearestWindow,
  subtractWindows,
  timeToMinutes,
  TIME_RANGE_STEP_MINUTES,
  type MinuteWindow,
} from "@recyclerie/api/domain/timeRange";
import { toIsoTime } from "@recyclerie/api/domain/date";
import type { TaskAssignedEmployeeDto } from "@recyclerie/api/responses/tasks";
import type {
  TaskAvailableEmployeeDto,
  WorkWindowDto,
} from "@recyclerie/api/responses/timeRanges";
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
import { createTimeRangeWriteQueue } from "./timeRangeWriteQueue";

/** How long to wait after the last drag tick before sending a Time range's new position. */
const RANGE_WRITE_DEBOUNCE_MS = 400;

const EMPLOYEE_COLORS = [
  "#4caf50",
  "#2196f3",
  "#ff9800",
  "#9c27b0",
  "#f44336",
  "#00bcd4",
  "#795548",
  "#607d8b",
];

const employeeColor = (employeeId: number) =>
  EMPLOYEE_COLORS[employeeId % EMPLOYEE_COLORS.length];

const employeeDisplayName = (employee: { fullName?: string; prenom: string; nom: string }) =>
  employee.fullName ?? `${employee.prenom} ${employee.nom}`;

const formatMinutes = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const hourMarks = (from: number, to: number): { value: number; label: string }[] => {
  const marks: { value: number; label: string }[] = [];
  const firstHour = Math.ceil(from / 60) * 60;
  for (let value = firstHour; value <= to; value += 60) {
    marks.push({ value, label: formatMinutes(value) });
  }
  return marks;
};

const isMinuteRange = (value: number | readonly number[]): value is [number, number] =>
  Array.isArray(value) && value.length === 2;

const toMinuteWindow = (window: WorkWindowDto | { start_time: string; end_time: string }): MinuteWindow => ({
  start: timeToMinutes(window.start_time),
  end: timeToMinutes(window.end_time),
});

/** One Time range as edited locally; `id` is null until its create call resolves. */
interface LocalRange {
  key: string;
  id: number | null;
  employeeId: number;
  start: number;
  end: number;
}

interface EmployeeInfo {
  id: number;
  nom: string;
  prenom: string;
  fullName?: string | undefined;
  workWindows: WorkWindowDto[];
  busyRanges: { start_time: string; end_time: string }[];
}

const otherLocalRangesForEmployee = (
  ranges: readonly LocalRange[],
  employeeId: number,
  exceptKey?: string,
): MinuteWindow[] =>
  ranges
    .filter((range) => range.employeeId === employeeId && range.key !== exceptKey)
    .map((range) => ({ start: range.start, end: range.end }));

const freeWindowsForEmployee = (
  task: MinuteWindow,
  info: EmployeeInfo,
  ranges: readonly LocalRange[],
  exceptKey?: string,
): MinuteWindow[] =>
  assignableWindows({
    task,
    workWindows: info.workWindows.map(toMinuteWindow),
    otherRanges: [
      ...info.busyRanges.map(toMinuteWindow),
      ...otherLocalRangesForEmployee(ranges, info.id, exceptKey),
    ],
  });

interface CoverageSegment {
  start: number;
  end: number;
  count: number;
}

const coverageAt = (ranges: readonly LocalRange[], minute: number): number =>
  ranges.filter((range) => range.start <= minute && range.end > minute).length;

const coverageSegments = (task: MinuteWindow, ranges: readonly LocalRange[]): CoverageSegment[] => {
  const raw: CoverageSegment[] = [];
  for (let start = task.start; start < task.end; start += TIME_RANGE_STEP_MINUTES) {
    const end = Math.min(start + TIME_RANGE_STEP_MINUTES, task.end);
    raw.push({ start, end, count: coverageAt(ranges, start) });
  }
  const merged: CoverageSegment[] = [];
  for (const segment of raw) {
    const last = merged[merged.length - 1];
    if (last && last.count === segment.count && last.end === segment.start) {
      last.end = segment.end;
    } else {
      merged.push({ ...segment });
    }
  }
  return merged;
};

const COVERAGE_COLORS = ["#cfd8dc", "#ffb74d", "#66bb6a", "#2e7d32"];
const coverageColor = (count: number) => COVERAGE_COLORS[Math.min(count, 3)];

interface TaskAssignmentDialogTitleProps {
  taskName: string;
  storeName: string;
}

const TaskAssignmentDialogTitle = ({ taskName, storeName }: TaskAssignmentDialogTitleProps) => (
  <DialogTitle>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Store color="primary" />
      <Box>
        <Typography variant="h6">
          Assigner des employés à la tâche: {taskName}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          Magasin: {storeName || "Non spécifié"}
        </Typography>
      </Box>
    </Box>
  </DialogTitle>
);

interface TaskAssignmentDialogInfoProps {
  storeName: string;
  scheduledDate: string;
}

const TaskAssignmentDialogInfo = ({ storeName, scheduledDate }: TaskAssignmentDialogInfoProps) => {
  const dayName = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString("fr-FR", { weekday: "long" })
    : "jour sélectionné";

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        bgcolor: "#e3f2fd",
        borderRadius: 1,
        border: "1px solid #2196f3",
      }}
    >
      <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Store sx={{ fontSize: 16, color: "#1976d2" }} />
        <strong>Filtrage par magasin et présence:</strong> Seuls les employés du
        magasin "{storeName || "Non spécifié"}" qui travaillent le {dayName} sont
        affichés.
      </Typography>
    </Box>
  );
};

type CoverageTimelineProps = {
  task: MinuteWindow;
  ranges: readonly LocalRange[];
};

const CoverageTimeline = ({ task, ranges }: CoverageTimelineProps) => {
  const duration = task.end - task.start;
  const segments = useMemo(() => coverageSegments(task, ranges), [task, ranges]);
  if (duration <= 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        Effectif sur la tâche
      </Typography>
      <Box
        role="group"
        aria-label="Effectif assigné au cours de la tâche"
        sx={{
          display: "flex",
          height: 36,
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid #b0bec5",
        }}
      >
        {segments.map((segment) => (
          <Tooltip
            key={segment.start}
            title={`${formatMinutes(segment.start)}–${formatMinutes(segment.end)} · ${segment.count} employé${segment.count > 1 ? "s" : ""}`}
          >
            <Box
              sx={{
                width: `${((segment.end - segment.start) / duration) * 100}%`,
                bgcolor: coverageColor(segment.count),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: segment.count === 0 ? "#37474f" : "#fff",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {segment.count}
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Box>
  );
};

const BLOCKED_FILL =
  "repeating-linear-gradient(-45deg, #e57373, #e57373 4px, #ffcdd2 4px, #ffcdd2 8px)";

type RangeSliderProps = {
  task: MinuteWindow;
  range: LocalRange;
  label: string;
  color: string;
  free: readonly MinuteWindow[];
  employeeName: string;
  onChange: (start: number, end: number) => void;
};

const RangeSlider = ({ task, range, label, color, free, employeeName, onChange }: RangeSliderProps) => {
  const blocked = subtractWindows(task, free);

  return (
    <Box sx={{ px: 1.5 }}>
      <Box sx={{ position: "relative", height: 56 }}>
        <Box
          sx={{
            position: "absolute",
            inset: "18px 0 auto 0",
            height: 10,
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: alpha(color, 0.35),
            pointerEvents: "none",
          }}
        >
          {blocked.map((window) => (
            <Box
              key={`${window.start}-${window.end}`}
              sx={{
                position: "absolute",
                left: `${((window.start - task.start) / (task.end - task.start)) * 100}%`,
                width: `${((window.end - window.start) / (task.end - task.start)) * 100}%`,
                top: 0,
                bottom: 0,
                background: BLOCKED_FILL,
              }}
            />
          ))}
          <Box
            sx={{
              position: "absolute",
              left: `${((range.start - task.start) / (task.end - task.start)) * 100}%`,
              width: `${((range.end - range.start) / (task.end - task.start)) * 100}%`,
              top: 0,
              bottom: 0,
              bgcolor: color,
            }}
          />
        </Box>
        <Slider
          getAriaLabel={(thumb) => `${thumb === 0 ? "Début" : "Fin"} ${label} de ${employeeName}`}
          getAriaValueText={formatMinutes}
          value={[range.start, range.end]}
          min={task.start}
          max={task.end}
          step={TIME_RANGE_STEP_MINUTES}
          disableSwap
          marks={hourMarks(task.start, task.end)}
          valueLabelDisplay="auto"
          valueLabelFormat={formatMinutes}
          onChange={(_event, value, activeThumb) => {
            if (!isMinuteRange(value)) return;
            const fragment = nearestWindow(free, activeThumb === 0 ? value[0] : value[1]);
            if (!fragment) return;
            const clamped = clampRangeToWindow(value, fragment);
            if (!clamped) return;
            onChange(clamped[0], clamped[1]);
          }}
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 4,
            color,
            "& .MuiSlider-rail": { display: "none" },
            "& .MuiSlider-track": { display: "none" },
            "& .MuiSlider-thumb": { width: 16, height: 16 },
            "& .MuiSlider-valueLabel": { pointerEvents: "none" },
            "& .MuiSlider-markLabel": { fontSize: 10 },
          }}
        />
      </Box>
    </Box>
  );
};

type AssignedEmployeeRowProps = {
  task: MinuteWindow;
  info: EmployeeInfo;
  employeeRanges: readonly LocalRange[];
  allRanges: readonly LocalRange[];
  onUpdateRange: (range: LocalRange, start: number, end: number) => void;
  onAddRange: (employeeId: number) => void;
  onRemoveRange: (range: LocalRange) => void;
  onRemoveEmployee: (employeeId: number) => void;
};

const AssignedEmployeeRow = ({
  task,
  info,
  employeeRanges,
  allRanges,
  onUpdateRange,
  onAddRange,
  onRemoveRange,
  onRemoveEmployee,
}: AssignedEmployeeRowProps) => {
  const color = employeeColor(info.id);
  const name = employeeDisplayName(info);
  const canAddRange = freeWindowsForEmployee(task, info, allRanges).length > 0;

  return (
    <Card variant="outlined" sx={{ borderLeft: "4px solid", borderLeftColor: color }}>
      <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32, bgcolor: color, fontSize: 14 }}>
            {name
              .split(" ")
              .map((part) => part[0])
              .join("")}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {name}
            </Typography>
          </Box>
          <Tooltip describeChild title={canAddRange ? "" : "Plus de plage horaire libre"}>
            <span>
              <Button
                size="small"
                startIcon={<AddCircleOutline />}
                disabled={!canAddRange}
                aria-label={`Ajouter une plage horaire pour ${name}`}
                onClick={() => onAddRange(info.id)}
              >
                Ajouter une plage horaire
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="Retirer cet employé de la tâche">
            <IconButton
              size="small"
              color="error"
              aria-label={`Retirer ${name} de la tâche`}
              onClick={() => onRemoveEmployee(info.id)}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {employeeRanges.map((range, index) => {
            const label = `plage horaire ${index + 1}`;
            const free = freeWindowsForEmployee(task, info, allRanges, range.key);
            return (
              <Box key={range.key}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Plage horaire {index + 1} · {formatMinutes(range.start)}–
                    {formatMinutes(range.end)}
                  </Typography>
                  {employeeRanges.length > 1 ? (
                    <Tooltip title="Retirer cette plage horaire">
                      <IconButton
                        size="small"
                        aria-label={`Retirer le ${label} de ${name}`}
                        onClick={() => onRemoveRange(range)}
                      >
                        <Delete fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  ) : null}
                </Stack>
                <RangeSlider
                  task={task}
                  range={range}
                  label={label}
                  color={color}
                  free={free}
                  employeeName={name}
                  onChange={(start, end) => onUpdateRange(range, start, end)}
                />
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
};

type AvailableEmployeeRowProps = {
  task: MinuteWindow;
  employee: TaskAvailableEmployeeDto;
  onAssign: (employee: TaskAvailableEmployeeDto) => void;
};

const AvailableEmployeeRow = ({ task, employee, onAssign }: AvailableEmployeeRowProps) => {
  const free = assignableWindows({
    task,
    workWindows: employee.workWindows.map(toMinuteWindow),
    otherRanges: employee.busyRanges.map(toMinuteWindow),
  });
  const busy = free.length === 0;
  const name = employeeDisplayName(employee);

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        bgcolor: busy ? "#ffebee" : "#f1f8e9",
        border: busy ? "2px solid #f44336" : "1px solid #e0e0e0",
      }}
    >
      <CardContent sx={{ py: 1, px: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {busy ? (
              <Block color="error" sx={{ fontSize: 20 }} />
            ) : (
              <Person color="success" sx={{ fontSize: 20 }} />
            )}
            <Typography variant="body2" fontWeight="medium" sx={{ color: busy ? "#d32f2f" : "inherit" }}>
              {name}
            </Typography>
            {busy ? (
              <Chip label="Occupé" size="small" color="error" sx={{ fontSize: "0.7rem" }} />
            ) : (
              <Chip
                icon={<CheckCircle />}
                label="Libre"
                size="small"
                color="success"
                sx={{ fontSize: "0.7rem" }}
              />
            )}
          </Box>
          {busy ? (
            <span>
              <IconButton size="small" color="error" disabled aria-label={`Impossible d'assigner ${name}`}>
                <Block />
              </IconButton>
            </span>
          ) : (
            <Tooltip title="Assigner cet employé">
              <IconButton
                size="small"
                color="success"
                aria-label={`Assigner ${name}`}
                onClick={() => onAssign(employee)}
                sx={{ bgcolor: "#e8f5e8", "&:hover": { bgcolor: "#c8e6c9" } }}
              >
                <Add />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {!busy && (
          <Typography variant="caption" color="text.secondary">
            Libre{" "}
            {free
              .map((window) => `${formatMinutes(window.start)}–${formatMinutes(window.end)}`)
              .join(", ")}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

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
    if (assignedQuery.data && !hasSeededRef.current) {
      seedFromServer(assignedQuery.data);
      hasSeededRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedQuery.data]);

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

  const writeQueueRef = useRef<ReturnType<typeof createTimeRangeWriteQueue> | null>(null);
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

  const enqueueDelete = (employeeId: number, rangeId: number) => {
    writeQueue.enqueue(async () => {
      try {
        await deleteTimeRange(taskId, employeeId, rangeId);
      } catch (error) {
        await revertToServerRef.current();
        toast.error(getApiErrorMessage(error, "Erreur lors de la suppression de la plage horaire"));
      }
    });
  };

  const createRangeFor = (employeeId: number, key: string, onAssigned?: () => void) => {
    writeQueue.enqueue(async () => {
      const current = rangesRef.current.find((range) => range.key === key);
      if (!current) return;
      try {
        const response = await createTimeRange(taskId, employeeId, {
          start_time: minutesToTime(current.start),
          end_time: minutesToTime(current.end),
        });
        const created = response.data.data;
        if (pendingRemovalRef.current.delete(key)) {
          enqueueDelete(employeeId, created.id);
          return;
        }
        setRangesTracked((prev) =>
          prev.map((range) => (range.key === key ? { ...range, id: created.id } : range)),
        );
        onAssigned?.();
      } catch (error) {
        await revertToServerRef.current();
        toast.error(getApiErrorMessage(error, "Erreur lors de l'ajout de la plage horaire"));
      }
    });
  };

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
    writeQueue.enqueue(async () => {
      const current = rangesRef.current.find((range) => range.key === key);
      if (!current) return;
      try {
        const response = await addEmployeeToTask(taskId, employee.id, {
          start_time: minutesToTime(current.start),
          end_time: minutesToTime(current.end),
        });
        const created = response.data.data;
        if (pendingRemovalRef.current.delete(key)) {
          enqueueDelete(employee.id, created.id);
          return;
        }
        setRangesTracked((prev) =>
          prev.map((range) => (range.key === key ? { ...range, id: created.id } : range)),
        );
        onAssignEmployee?.(employee.id);
      } catch (error) {
        await revertToServerRef.current();
        toast.error(getApiErrorMessage(error, "Erreur lors de l'assignation"));
      }
    });
  };

  const unassignEmployee = (employeeId: number) => {
    hasChangesRef.current = true;
    for (const range of rangesRef.current.filter((range) => range.employeeId === employeeId)) {
      writeQueue.cancel(range.key);
    }
    setRangesTracked((prev) => prev.filter((range) => range.employeeId !== employeeId));
    writeQueue.enqueue(async () => {
      try {
        await removeEmployeeFromTask(taskId, employeeId);
        onUnassignEmployee?.(employeeId);
      } catch (error) {
        await revertToServerRef.current();
        toast.error(getApiErrorMessage(error, "Erreur lors du retrait"));
      }
    });
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
    createRangeFor(employeeId, key);
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
      async () => {
        const current = rangesRef.current.find((item) => item.key === range.key);
        if (!current || current.id == null) return;
        try {
          await updateTimeRange(taskId, current.employeeId, current.id, {
            start_time: minutesToTime(current.start),
            end_time: minutesToTime(current.end),
          });
        } catch (error) {
          await revertToServerRef.current();
          toast.error(getApiErrorMessage(error, "Erreur lors de la modification de la plage horaire"));
        }
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

        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Person color="primary" />
              Employés assignés ({assignedEmployeeIds.length})
            </Typography>
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
          </Grid>
        </Grid>
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
