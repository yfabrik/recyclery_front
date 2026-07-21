import type { EmployeeDataInput } from "@recyclerie/api/schemas/employees";
import type { EmployeeFormOutput, EmployeeFormValues } from "../schema/employee";
import type { EmployeeModel } from "../../interfaces/Models";

export function employeeToFormValues(employee: EmployeeModel): Partial<EmployeeFormValues> {
    return {
      prenom: employee.prenom,
      nom: employee.nom,
      phone: employee.phone ?? "",
      isActive: employee.isActive,
      recyclery_id: employee.stores?.[0]?.id ?? "",
    };
  }

export const employeePayloadFromForm = (data: EmployeeFormOutput): EmployeeDataInput => ({...data});
