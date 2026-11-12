import { useQuery } from "@tanstack/react-query";
import { getWeekRangeFromDate } from "../services/dateService";
import { getTasks } from "../services/api/tasks";

type Week = ReturnType<typeof getWeekRangeFromDate>;

/**
 * Key of the displayed week's Tasks. It starts with `"tasks"`, like every Task list of the
 * Planning page, so anything that invalidates `["tasks"]` (the Task and Employee day dialogs
 * closing with changes, Task mutations) refreshes it. It carries no view mode and no Store.
 */
export const weekTasksQueryKey = (week: Week) => ["tasks", "week", { include: ["user"], ...week }] as const;

/**
 * Every Task of the week containing `selectedDate` (Monday to Sunday) with its assigned
 * Employees (`include=user`), whatever the Planning view mode and Store filter: the presence
 * header's markers count an Employee's Tasks over all Stores, like the Employee day dialog.
 */
export const useWeekTasks = (selectedDate: Date) => {
  const week = getWeekRangeFromDate(selectedDate);
  return useQuery({
    queryKey: weekTasksQueryKey(week),
    queryFn: () => getTasks({ include: ["user"], ...week }).then((response) => response.data.data),
  });
};
