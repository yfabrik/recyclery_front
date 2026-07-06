import { Print } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useSearchParams, Link as RouterLink } from "react-router";
import { EmployeeTasksTimeline, type EmployeeTaskItem } from "../components/planning/EmployeeTasksTimeline";
import type { EmployeeModel, TaskModel } from "../interfaces/Models";
import { getWeekRangeFromDate } from "../services/dateService";
import { getTasks } from "../services/api/tasks";
import { fetchStores as fstore } from "../services/api/store";

function toTaskItem(s: TaskModel): EmployeeTaskItem {
  const scheduled = new Date(s.scheduled_date);
  const dayOfWeek = scheduled.toLocaleDateString("fr-FR", { weekday: "long" });
  const dayOfWeekCapitalized = dayOfWeek.replace(/^\w/, (c) => c.toUpperCase());
  return {
    name: s.name,
    start_time: s.start_time,
    end_time: s.end_time,
    day_of_week: (s as TaskModel & { day_of_week?: string }).day_of_week ?? dayOfWeekCapitalized,
    category: s.category,
  };
}

function getEmployeeName(emp: EmployeeModel): string {
  return (
    (emp.fullName ??
    `${emp.prenom ?? ""} ${emp.nom ?? ""}`.trim()) ||
    "Employé"
  );
}

export default function PlanningPrint() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date");
  const storeIdParam = searchParams.get("store_id");

  const selectedDate = dateParam ? new Date(dateParam) : new Date();
  const storeId = storeIdParam ? Number(storeIdParam) : undefined;
  const { date_from, date_to } = getWeekRangeFromDate(selectedDate);

  const tasksQuery = useQuery({
    queryKey: ["tasks", "print", { store_id: storeId, date_from, date_to }],
    queryFn: () =>
      getTasks({
        store_id: storeId,
        include: ["user", "store"],
        date_from,
        date_to,
      }).then((r) => r.data.tasks),
  });

  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: () => fstore({ include: ["employees"] }).then((r) => r.data.data),
  });

  const storeName =
    storeId && storesQuery.data
      ? storesQuery.data.find((s) => s.id === storeId)?.name
      : null;

  const byEmployee = (() => {
    const list = tasksQuery.data ?? [];
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

    list.forEach((s) => {
      const employees = s.Employees ?? [];
      if (employees.length > 0) {
        employees.forEach((emp: EmployeeModel) => {
          add(getEmployeeName(emp), emp.id, s);
        });
      } else {
        // add("Non assigné", undefined, s);
      }
    });

    const sortByDateThenTime = (a: TaskModel, b: TaskModel) => {
      const dateA = new Date(a.scheduled_date).toISOString().slice(0,10)
      const dateB = new Date(b.scheduled_date).toISOString().slice(0,10)
      if (dateA !== dateB) return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
      const timeA = new Date(a.start_time).getTime();
      const timeB = new Date(b.start_time).getTime();
      return timeA - timeB;
    };

    return Array.from(map.values()).map((g) => ({
      employeeName: g.employeeName,
      employeeId: g.employeeId,
      tasks: g.rawTasks
        .sort(sortByDateThenTime)
        .map((s) => toTaskItem(s)),
    }));
  })();

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

  const employeeRows = useMemo(() => {
    const rows: (typeof byEmployee)[] = [];
    for (let i = 0; i < byEmployee.length; i += 2) {
      rows.push(byEmployee.slice(i, i + 2));
    }
    return rows;
  }, [byEmployee]);

  const printContentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
    pageStyle: printPageStyle,
    documentTitle: `Planning semaine ${date_from} ${storeName ?? ""}`.trim(),
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 3, px: 2 }}>
      <Box className="no-print" sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          component={RouterLink}
          to="/admin/planning"
          variant="outlined"
          size="small"
        >
          Retour au planning
        </Button>
        <Button variant="contained" startIcon={<Print />} onClick={handlePrint}>
          Imprimer
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

        {tasksQuery.isSuccess && byEmployee.length === 0 && (
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
    </Box>
  );
}
