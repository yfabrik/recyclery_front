export type VacationDateRange = {
  employee_id?: number;
  start_date: string;
  end_date: string;
};

/** Inclusive calendar-date overlap (`YYYY-MM-DD`). */
export function vacationOverlapsDate(
  vacation: Pick<VacationDateRange, "start_date" | "end_date">,
  date: string,
): boolean {
  return vacation.start_date <= date && date <= vacation.end_date;
}

export function employeeIdsOnVacationOnDate(
  vacations: readonly (VacationDateRange & { employee_id: number })[],
  date: string,
): ReadonlySet<number> {
  const ids = new Set<number>();
  for (const vacation of vacations) {
    if (vacationOverlapsDate(vacation, date)) {
      ids.add(vacation.employee_id);
    }
  }
  return ids;
}
