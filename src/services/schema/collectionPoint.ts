import { phoneSchema, postalSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import { noEmptyStr, optionalId } from "../../interfaces/ZodTypes";

export const collectionPointFormSchema = z.object({
  name: noEmptyStr("nom requis"),
  address: noEmptyStr("address requis"),
  city: noEmptyStr("ville requis"),
  postal_code: postalSchema("code postal requis"),
  contact_person: z.string(),
  contact_phone: z.union([z.literal(""), phoneSchema()]),
  contact_email: z.union([z.literal(""), z.email()]),
  notes: z.string(),
  is_active: z.boolean(),
  recyclery_id: optionalId(),
});

export type CollectionPointFormOutput = z.infer<
  typeof collectionPointFormSchema
>;
export type CollectionPointFormValues = z.input<
  typeof collectionPointFormSchema
>;
