import { idSchema, phoneSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import { noEmptyStr, optionalId } from "../../interfaces/ZodTypes";

/**
 * URL / form state of the employee list filters. Client-side only: the list is
 * filtered in memory and none of these fields are sent to the API.
 */
export const employeeFilterFormSchema =z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  store_id: z.union([idSchema(), z.literal("")]).optional(),
});
export type EmployeeFilterFormValues = z.infer<typeof employeeFilterFormSchema>;
export type EmployeeFilterFormInput = z.input<typeof employeeFilterFormSchema>;

const defaultFilterValues: EmployeeFilterFormInput = {
  search: "",
  status: "",
  store_id: "",
};

export const EMPLOYEE_FILTER_FORM_DEFAULTS = defaultFilterValues;

export const employeeFormSchema = z.object({
  prenom: noEmptyStr("prenom requis"),
  nom: noEmptyStr("nom requis"),
  phone: z.union([z.literal(""), phoneSchema()]),
  recyclery_id: optionalId(),
  isActive: z.boolean(),
});

export type EmployeeFormOutput = z.infer<typeof employeeFormSchema>;
export type EmployeeFormValues = z.input<typeof employeeFormSchema>;

export const employeeSkillFormSchema = z.object({
  skills: z.array(z.number()),
});

export type EmployeeSkillFormValues = z.input<typeof employeeSkillFormSchema>;
export type EmployeeSkillFormOutput = z.infer<typeof employeeSkillFormSchema>;

export const employeeStoresFormSchema = z.object({
  assignedStoreIds: z.array(z.number()),
  primaryStoreId: z.number(),
});

export type EmployeeStoresFormValues = z.input<
  typeof employeeStoresFormSchema
>;
export type EmployeeStoresFormOutput = z.infer<
  typeof employeeStoresFormSchema
>;
