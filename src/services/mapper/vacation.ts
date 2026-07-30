import type { EmployeeVacationDto } from "@recyclerie/api/responses/vacations";
import type {
  VacationBodyInput,
  VacationUpdateInput,
} from "@recyclerie/api/schemas/vacations";
import { toIsoDate } from "../dateService";
import type {
  VacationFormOutput,
  VacationFormValues,
} from "../schema/vacation";

export function vacationToFormValues(
  vacation: EmployeeVacationDto,
): Partial<VacationFormValues> {
  return {
    start_date: new Date(vacation.start_date),
    end_date: new Date(vacation.end_date),
    reason: vacation.reason,
  };
}

export const vacationPayloadFromForm = (
  data: VacationFormOutput,
): VacationBodyInput =>
  ({
    start_date: toIsoDate(data.start_date),
    end_date: toIsoDate(data.end_date),
    reason: data.reason,
  }) satisfies VacationBodyInput;

export const vacationUpdatePayloadFromForm = (
  data: VacationFormOutput,
): VacationUpdateInput =>
  ({
    start_date: toIsoDate(data.start_date),
    end_date: toIsoDate(data.end_date),
    reason: data.reason,
  }) satisfies VacationUpdateInput;
