import z from "zod";
import { noEmptyStr, nullString, } from "../../interfaces/ZodTypes";
import { idSchema, phoneSchema } from "@recyclerie/api/primitives/zod";

export const employeeFilterSchema = z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    store_id: z.union([idSchema(), z.literal("")]).optional(),
  });
  export type EmployeeFilters = z.infer<typeof employeeFilterSchema>;
  export type EmployeeFiltersValues = z.input<typeof employeeFilterSchema>;


  const defaultFilterValues: EmployeeFiltersValues = {
    search: "",
    status: "",
    store_id: "",
  };

  export const EMPLOYEE_FILTER_DEFAULTS = defaultFilterValues;



export const employeeFormSchema = z.object({
    prenom: noEmptyStr("prenom requis"),
    nom: noEmptyStr("nom requis"),
    phone: z.union([nullString(),phoneSchema()]),
    recyclery_id: z.union([nullString(),idSchema()]),
    isActive: z.boolean().default(true),
  });

  export type EmployeeFormOutput = z.infer<typeof employeeFormSchema>;
  export type EmployeeFormValues = z.input<typeof employeeFormSchema>;
