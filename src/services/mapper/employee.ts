import type { EmployeeDataInput } from "@recyclerie/api/schemas/employees";
import type { EmployeeModel } from "../../interfaces/Models";
import type {
  EmployeeFormOutput,
  EmployeeFormValues,
  EmployeeSkillFormOutput,
  EmployeeStoresFormOutput,
} from "../schema/employee";
import { emptyToNull } from "../zodTransform";

export function employeeToFormValues(
  employee: EmployeeModel,
): Partial<EmployeeFormValues> {
  return {
    prenom: employee.prenom,
    nom: employee.nom,
    phone: employee.phone ?? "",
    isActive: employee.isActive,
    recyclery_id: employee.stores?.[0]?.id ?? "",
  };
}

export const employeePayloadFromForm = (
  data: EmployeeFormOutput,
): EmployeeDataInput =>
  ({
    prenom: data.prenom,
    nom: data.nom,
    phone: emptyToNull(data.phone),
    recyclery_id: data.recyclery_id === "" ? null : data.recyclery_id,
    isActive: data.isActive,
  }) satisfies EmployeeDataInput;

export const employeeSkillPayloadFromForm = (
  data: EmployeeSkillFormOutput,
): EmployeeSkillFormOutput => data;

export type EmployeeStoreAssignmentPayload = {
  store_id: number;
  is_primary: boolean;
};

/** Expand stores form into per-store assignment rows for the API. */
export const employeeStoresPayloadFromForm = (
  data: EmployeeStoresFormOutput,
): EmployeeStoreAssignmentPayload[] =>
  data.assignedStoreIds.map((storeId) => ({
    store_id: storeId,
    is_primary: storeId === data.primaryStoreId,
  }));
