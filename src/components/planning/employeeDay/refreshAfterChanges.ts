import type { QueryClient } from "@tanstack/react-query";
import { EMPLOYEE_TASKS_QUERY_KEY } from "../../../hooks/useEmployeeDayTasks";

/**
 * Query prefixes made stale by assigning or unassigning an Employee from the day dialog:
 * the Planning page's Task lists (and every `tasks` query, the week query of the presence
 * header included), what the Task assignment dialog seeds from, and the day dialogs' own data.
 */
export const EMPLOYEE_DAY_STALE_QUERY_KEYS = [
  ["tasks"],
  ["taskAvailableEmployees"],
  ["taskAssignedEmployees"],
  EMPLOYEE_TASKS_QUERY_KEY,
] as const;

/** Marks those queries stale and refetches the ones on screen. */
export const invalidateAfterEmployeeDayChanges = (queryClient: QueryClient): Promise<unknown> =>
  Promise.all(EMPLOYEE_DAY_STALE_QUERY_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
