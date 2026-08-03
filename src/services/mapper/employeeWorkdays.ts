import type { WorkdaysFormPayload } from "../api/employee";
import { formatTime } from "../dateService";
import type { EmployeeWorkdaysFormOutput } from "../schema/employeeWorkdays";

export function workdaysPayloadFromForm(
  data: EmployeeWorkdaysFormOutput,
): WorkdaysFormPayload {
  const mapDay = (
    day: EmployeeWorkdaysFormOutput["week1"][number],
  ): WorkdaysFormPayload["week1"][number] => ({
    day_of_week: day.day_of_week,
    start_time: formatTime(day.start_time),
    end_time: formatTime(day.end_time),
    is_working: day.is_working,
    time_slot: day.time_slot,
  });
  return {
    week1: data.week1.map(mapDay),
    week2: data.week2.map(mapDay),
  };
}
