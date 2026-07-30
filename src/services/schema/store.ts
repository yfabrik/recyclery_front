import { phoneSchema, postalSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import { noEmptyStr, optionalId } from "../../interfaces/ZodTypes";

export const storeFormSchema = z.object({
  name: noEmptyStr("nom requis"),
  manager_id: optionalId(),
  address: z.string(),
  city: z.string(),
  postal_code: z.union([z.literal(""), postalSchema()]),
  phone: z.union([z.literal(""), phoneSchema()]),
  email: z.union([z.literal(""), z.email()]),
  is_active: z.boolean(),
});

export type StoreFormOutput = z.infer<typeof storeFormSchema>;
export type StoreFormValues = z.input<typeof storeFormSchema>;
