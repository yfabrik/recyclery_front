import z from "zod";
import {
  USER_ROLE_VALUES,
} from "../../constants/userRoles";
import {
  noEmptyStr,
  optionalId,
  phoneSchema,
} from "../../interfaces/ZodTypes";

export const userFormSchema = z.object({
  username: noEmptyStr("username requis"),
  email: z.email("email requis"),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.union([z.literal(""), phoneSchema()]),
  password: z.string(),
  role: z.enum(USER_ROLE_VALUES, "role requis"),
  recyclery_id: optionalId(),
  isActive: z.boolean(),
  managedStores: z.array(z.number().positive()),
});

export type UserFormValues = z.input<typeof userFormSchema>;
export type UserFormOutput = z.infer<typeof userFormSchema>;
