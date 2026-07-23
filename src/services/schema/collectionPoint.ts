import z from "zod";
import { noEmptyStr, nullString,} from "../../interfaces/ZodTypes";
import { idSchema, phoneSchema, postalSchema } from "@recyclerie/api/primitives/zod";

export const collectionPointFormSchema = z.object({
    name: noEmptyStr("nom requis"),
    address: noEmptyStr("address requis"),
    city: noEmptyStr("ville requis"),
    postal_code: postalSchema("code postal requis"),
    contact_person: z.string().transform((val) => (val == "" ? null : val)),
    contact_phone: z.union([nullString(), phoneSchema()]),
    contact_email: z.union([nullString(), z.email()]),
    notes: z.string().transform((val) => (val == "" ? null : val)),
    is_active: z.boolean(),
    recyclery_id: z.union([nullString(), idSchema()]),
});

export type CollectionPointFormOutput = z.infer<typeof collectionPointFormSchema>;
export type CollectionPointFormValues = z.input<typeof collectionPointFormSchema>;
