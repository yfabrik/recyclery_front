import { Print } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams, Link as RouterLink } from "react-router";
import { dayjs, toIsoDate, toIsoTime, weekday } from "@recyclerie/api/domain/date";
import type { TimeSlot } from "@recyclerie/api/enums";
import { EmployeeTasksTimeline, type EmployeeTaskItem } from "../components/planning/EmployeeTasksTimeline";
import type { TaskModel } from "../interfaces/Models";
import { getWeekRangeFromDate, weekdayLabel } from "../services/dateService";
import { getTasks } from "../services/api/tasks";
import { fetchStores as fstore } from "../services/api/store";
import {
  assigneesForPrint,
  defaultSelectedEmployeeIds,
  employeesWithAssignedTasks,
  filterPrintTasks,
  printedTasksMixStores,
  printEmployeeName,
  type PrintMode,
} from "../services/planning/printSelection";

function toTaskItem(s: TaskModel, storeName: string | null): EmployeeTaskItem {
  const scheduled = new Date(s.scheduled_date);
  const dayOfWeek = weekdayLabel(weekday(scheduled));
  return {
    name: s.name,
    start_time: s.start_time,
    end_time: s.end_time,
    day_of_week: dayOfWeek,
    category: s.category,
    storeName,
  };
}

function formatTaskCell(task: TaskModel): string {
  return `${toIsoTime(task.start_time)}-${toIsoTime(task.end_time)} ${task.name}`;
}

function taskStoreName(task: TaskModel): string | null {
  return task.Recyclery?.name ?? null;
}

function getTaskSlot(task: TaskModel): TimeSlot {
  return new Date(task.start_time).getHours() < 13 ? "morning" : "afternoon";
}

const NO_TASKS: TaskModel[] = [];

function PrintGridTaskLines({
  lines,
  cellKey,
}: {
  lines: { text: string; storeName: string | null }[];
  cellKey: string;
}) {
  return lines.map((line, index) => (
    <Box key={`${cellKey}-${index}`} sx={{ mb: 0.5 }}>
      <Box>{line.text}</Box>
      {line.storeName ? (
        <Box sx={{ fontSize: "0.75em", color: "#666" }}>{line.storeName}</Box>
      ) : null}
    </Box>
  ));
}

export default function PlanningPrint() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const storeIdParam = searchParams.get("store_id");

  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  const storeId = storeIdParam ? Number(storeIdParam) : undefined;
  const { date_from, date_to } = getWeekRangeFromDate(selectedDate);

  const [printMode, setPrintMode] = useState<PrintMode>("store");
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<
    number[] | null
  >(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks", "print", { date_from, date_to }],
    queryFn: () =>
      getTasks({
        include: ["user", "store"],
        date_from,
        date_to,
      }).then((r) => r.data.data),
  });

  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: () => fstore({ include: ["employees"] }).then((r) => r.data.data),
  });

  const storeName =
    printMode === "store" && storeId && storesQuery.data
      ? storesQuery.data.find((s) => s.id === storeId)?.name
      : null;

  const weekTasks = tasksQuery.data ?? NO_TASKS;

  const pickerEmployees = useMemo(
    () => employeesWithAssignedTasks(weekTasks),
    [weekTasks],
  );

  const selectedIds = useMemo(
    () => selectedEmployeeIds ?? defaultSelectedEmployeeIds(weekTasks, storeId),
    [selectedEmployeeIds, weekTasks, storeId],
  );

  const printedTasks = useMemo(
    () =>
      filterPrintTasks({
        mode: printMode,
        storeId,
        selectedEmployeeIds: selectedIds,
        tasks: weekTasks,
      }),
    [printMode, storeId, selectedIds, weekTasks],
  );

  const showStoreOnTasks = printedTasksMixStores(printedTasks);

  const byEmployee = useMemo(() => {
    const map = new Map<
      string,
      { employeeName: string; employeeId?: number; rawTasks: TaskModel[] }
    >();

    const add = (empName: string, empId: number | undefined, task: TaskModel) => {
      const key = empId != null ? `id-${empId}` : `name-${empName}`;
      if (!map.has(key)) {
        map.set(key, { employeeName: empName, employeeId: empId, rawTasks: [] });
      }
      map.get(key)!.rawTasks.push(task);
    };

    printedTasks.forEach((s) => {
      assigneesForPrint(s, printMode, selectedIds).forEach((emp) => {
        add(printEmployeeName(emp), emp.id, s);
      });
    });

    const sortByDateThenTime = (a: TaskModel, b: TaskModel) => {
      const dateA = toIsoDate(a.scheduled_date);
      const dateB = toIsoDate(b.scheduled_date);
      if (dateA !== dateB) {
        return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
      }
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    };

    return Array.from(map.values()).map((g) => {
      const rawTasks = [...g.rawTasks].sort(sortByDateThenTime);
      return {
        employeeName: g.employeeName,
        employeeId: g.employeeId,
        rawTasks,
        tasks: rawTasks.map((s) =>
          toTaskItem(s, showStoreOnTasks ? taskStoreName(s) : null),
        ),
      };
    });
  }, [printedTasks, printMode, selectedIds, showStoreOnTasks]);

  const weekDays = useMemo(() => {
    const start = dayjs(date_from);
    return Array.from({ length: 7 }, (_, i) => {
      const d = start.add(i, "day");
      const short = d.locale("fr").format("ddd");
      const capitalized = short.charAt(0).toUpperCase() + short.slice(1);
      return {
        iso: toIsoDate(d.toDate()),
        morningLabel: `${capitalized} matin`,
        afternoonLabel: `${capitalized} après-midi`,
      };
    });
  }, [date_from]);

  const gridRows = useMemo(() => {
    return byEmployee.map(({ employeeName, employeeId, rawTasks }) => {
      const cells: Record<
        string,
        { text: string; storeName: string | null }[]
      > = {};
      for (const day of weekDays) {
        cells[`${day.iso}-morning`] = [];
        cells[`${day.iso}-afternoon`] = [];
      }
      for (const task of rawTasks) {
        const dayKey = toIsoDate(task.scheduled_date);
        const slot = getTaskSlot(task);
        const key = `${dayKey}-${slot}`;
        if (!(key in cells)) continue;
        cells[key].push({
          text: formatTaskCell(task),
          storeName: showStoreOnTasks ? taskStoreName(task) : null,
        });
      }
      return { employeeName, employeeId, cells };
    });
  }, [byEmployee, weekDays, showStoreOnTasks]);

  const weekLabel = useMemo(() => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const from = new Date(date_from).toLocaleDateString("fr-FR", dateOptions);
    const to = new Date(date_to).toLocaleDateString("fr-FR", dateOptions);
    return `${from} - ${to}`;
  }, [date_from, date_to]);

  // TODO remake this cleaner
  const printPageStyle = `
    @page {
      margin: 12mm;
    }
    @media print {
      .planning-print-table thead {
        display: table-header-group;
      }
      .planning-print-table tbody {
        display: table-row-group;
      }
      .planning-print-table tr {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .planning-print-table th,
      .planning-print-table td {
        border: none;
        padding: 0;
        vertical-align: top;
        text-align: left;
        font-weight: normal;
      }
      .planning-print-table thead th {
        padding-bottom: 3mm;
        border-bottom: 1px solid #ccc;
      }
      .planning-print-table tbody td {
        width: 50%;
        padding-top: 3mm;
        padding-right: 4mm;
      }
      .planning-print-table tbody td:last-child {
        padding-right: 0;
        padding-left: 4mm;
      }
      .planning-print-table tbody td:only-child {
        padding-left: 0;
        padding-right: 0;
      }
    }
  `;

  const gridPrintPageStyle = `
    @page {
      size: landscape;
      margin: 8mm;
    }
    .planning-grid-print-root {
      display: block !important;
    }
    .planning-grid-print-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      table-layout: fixed;
    }
    .planning-grid-print-table thead {
      display: table-header-group;
    }
    .planning-grid-print-table th,
    .planning-grid-print-table td {
      border: 1px solid #333;
      padding: 2px 3px;
      vertical-align: top;
      text-align: left;
      word-break: break-word;
      white-space: pre-line;
    }
    .planning-grid-print-table th {
      font-weight: bold;
      background: #f0f0f0;
      text-align: center;
    }
    .planning-grid-print-table .employee-col {
      width: 10%;
      font-weight: bold;
      white-space: normal;
    }
    .planning-grid-print-table tr {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .planning-grid-print-header {
      margin-bottom: 4mm;
    }
  `;

  const employeeRows = useMemo(() => {
    const rows: (typeof byEmployee)[] = [];
    for (let i = 0; i < byEmployee.length; i += 2) {
      rows.push(byEmployee.slice(i, i + 2));
    }
    return rows;
  }, [byEmployee]);

  const printContentRef = useRef<HTMLDivElement>(null);
  const gridPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
    pageStyle: printPageStyle,
    documentTitle: `Planning semaine ${date_from} ${storeName ?? ""}`.trim(),
  });

  const handleGridPrint = useReactToPrint({
    contentRef: gridPrintRef,
    pageStyle: gridPrintPageStyle,
    documentTitle: `Planning tableau ${date_from} ${storeName ?? ""}`.trim(),
  });

  const employeePrintLocked =
    printMode === "employees" && selectedIds.length === 0;

  const selectedPickerValue = pickerEmployees.filter((employee) =>
    selectedIds.includes(employee.id),
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 3, px: 2 }}>
      <Box
        className="no-print"
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Button
          component={RouterLink}
          to="/admin/planning"
          variant="outlined"
          size="small"
        >
          Retour au planning
        </Button>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={printMode}
          onChange={(_event, value: PrintMode | null) => {
            if (value) setPrintMode(value);
          }}
        >
          <ToggleButton value="store">Magasin</ToggleButton>
          <ToggleButton value="employees">Employés</ToggleButton>
        </ToggleButtonGroup>
        {printMode === "employees" && (
          <Autocomplete
            multiple
            size="small"
            sx={{ minWidth: 280, flex: "1 1 280px" }}
            options={pickerEmployees}
            value={selectedPickerValue}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, value) =>
              setSelectedEmployeeIds(value.map((employee) => employee.id))
            }
            renderInput={(params) => (
              <TextField {...params} label="Employés" placeholder="Choisir" />
            )}
          />
        )}
        <Button
          variant="contained"
          startIcon={<Print />}
          onClick={handlePrint}
          disabled={employeePrintLocked}
        >
          Imprimer
        </Button>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handleGridPrint}
          disabled={
            employeePrintLocked ||
            !tasksQuery.isSuccess ||
            byEmployee.length === 0
          }
        >
          Imprimer tableau
        </Button>
      </Box>

      <Box ref={printContentRef}>
        <Box className="planning-print-header" sx={{ mb: 3, displayPrint: "none" }}>
          <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
            Planning de la semaine
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontSize: "1.15rem" }}
          >
            {weekLabel}
            {storeName && ` — ${storeName}`}
          </Typography>
        </Box>

        {tasksQuery.isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {tasksQuery.isError && (
          <Typography color="error">Erreur lors du chargement des tâches.</Typography>
        )}

        {employeePrintLocked && (
          <Typography color="text.secondary">
            Sélectionnez au moins un employé.
          </Typography>
        )}

        {tasksQuery.isSuccess && byEmployee.length === 0 && !employeePrintLocked && (
          <Typography color="text.secondary">Aucune tâche cette semaine.</Typography>
        )}

        {tasksQuery.isSuccess && byEmployee.length > 0 && (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 3,
                alignItems: "flex-start",
                displayPrint: "none",
              }}
            >
              {byEmployee.map(({ employeeName, tasks }) => (
                <Box
                  key={employeeName}
                  sx={{
                    minWidth: 320,
                    flex: "1 1 320px",
                    maxWidth: 480,
                  }}
                >
                  <EmployeeTasksTimeline
                    employeeName={employeeName}
                    tasks={tasks}
                  />
                </Box>
              ))}
            </Box>

            <Box
              component="table"
              className="planning-print-table"
              sx={{
                display: "none",
                displayPrint: "table",
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <Box component="thead">
                <Box component="tr">
                  <Box component="th" colSpan={2}>
                    <Typography
                      variant="h6"
                      component="p"
                      sx={{ fontWeight: "bold", mb: 0.25, fontSize: "1.1rem" }}
                    >
                      Planning de la semaine
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {weekLabel}
                      {storeName && ` — ${storeName}`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box component="tbody">
                {employeeRows.map((row, rowIndex) => (
                  <Box component="tr" key={rowIndex}>
                    {row.map(({ employeeName, tasks }) => (
                      <Box component="td" key={employeeName}>
                        <EmployeeTasksTimeline
                          employeeName={employeeName}
                          tasks={tasks}
                        />
                      </Box>
                    ))}
                    {row.length === 1 && <Box component="td" />}
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* Excel-style grid: print-only content for second print button */}
      <Box
        ref={gridPrintRef}
        className="planning-grid-print-root"
        sx={{ display: "none" }}
        aria-hidden
      >
        <Box className="planning-grid-print-header">
          <Typography
            variant="h6"
            component="p"
            sx={{ fontWeight: "bold", mb: 0.25, fontSize: "1rem" }}
          >
            Planning de la semaine (tableau)
          </Typography>
          <Typography variant="body2">
            {weekLabel}
            {storeName && ` — ${storeName}`}
          </Typography>
        </Box>
        <Box
          component="table"
          className="planning-grid-print-table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "9px",
            tableLayout: "fixed",
            "& th, & td": {
              border: "1px solid #333",
              padding: "2px 3px",
              verticalAlign: "top",
              textAlign: "left",
              wordBreak: "break-word",
              whiteSpace: "pre-line",
            },
            "& th": {
              fontWeight: "bold",
              backgroundColor: "#f0f0f0",
              textAlign: "center",
            },
          }}
        >
          <Box component="thead">
            <Box component="tr">
              <Box component="th" className="employee-col">
                Employé
              </Box>
              {weekDays.map((day) => (
                <Fragment key={day.iso}>
                  <Box component="th">{day.morningLabel}</Box>
                  <Box component="th">{day.afternoonLabel}</Box>
                </Fragment>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {gridRows.map(({ employeeName, employeeId, cells }) => (
              <Box component="tr" key={employeeId ?? employeeName}>
                <Box component="td" className="employee-col" sx={{ fontWeight: "bold" }}>
                  {employeeName}
                </Box>
                {weekDays.map((day) => (
                  <Fragment key={day.iso}>
                    <Box component="td">
                      <PrintGridTaskLines
                        cellKey={`${day.iso}-morning`}
                        lines={cells[`${day.iso}-morning`]}
                      />
                    </Box>
                    <Box component="td">
                      <PrintGridTaskLines
                        cellKey={`${day.iso}-afternoon`}
                        lines={cells[`${day.iso}-afternoon`]}
                      />
                    </Box>
                  </Fragment>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
