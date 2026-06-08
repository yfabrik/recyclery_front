import { Print } from "@mui/icons-material";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
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
    queryFn: () => fstore({ include: ["employees"] }).then((r) => r.data.stores),
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

  const weekLabel = selectedDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const printContentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printContentRef,
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

      <Box
        ref={printContentRef}
        sx={{
          "@media print": {
            padding: 4,
          },
        }}
      >
        <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
          Planning de la semaine
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontSize: "1.15rem" }}>
          {weekLabel}
          {storeName && ` — ${storeName}`}
        </Typography>

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
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 3,
              alignItems: "flex-start",
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
        )}
      </Box>
    </Box>
  );
}
