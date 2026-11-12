import { useQuery } from "@tanstack/react-query";
import type { EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import type { IsoDate } from "@recyclerie/api/primitives/zod";
import { getEmployeeTasks } from "../services/api/employee";

/**
 * Prefix shared by every Employee day query: invalidate it to refresh them all
 * (the Employee day dialog does so when it closes with changes).
 */
export const EMPLOYEE_TASKS_QUERY_KEY = ["employeeTasks"] as const;

/** Key of one Employee's single-day query: `date_from == date_to == date`. */
export const employeeDayQueryKey = (employeeId: number, date: IsoDate) =>
  [...EMPLOYEE_TASKS_QUERY_KEY, employeeId, date, date] as const;

interface UseEmployeeDayTasksOptions {
  employeeId: number;
  date: IsoDate;
  enabled?: boolean;
}

/**
 * One Employee's day: every Task they are assigned to, could be assigned to, or cannot
 * be assigned to (`GET /api/employees/:id/tasks` over a single date), plus that day's
 * Workday hours and Vacation. The endpoint takes no Store: the page's Store filter
 * never reaches it.
 */
export const useEmployeeDayTasks = ({ employeeId, date, enabled = true }: UseEmployeeDayTasksOptions) =>
  useQuery({
    queryKey: employeeDayQueryKey(employeeId, date),
    queryFn: async (): Promise<EmployeeTasksDayDto> => {
      const response = await getEmployeeTasks(employeeId, { date_from: date, date_to: date });
      const day = response.data.data.days.find((entry) => entry.date === date);
      if (!day) throw new Error(`Réponse sans le jour ${date}`);
      return day;
    },
    enabled,
  });
