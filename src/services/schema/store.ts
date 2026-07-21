import { idSchema, postalSchema, phoneSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import { noEmptyStr, nullString } from "../../interfaces/ZodTypes";

export const storeFormSchema = z.object({
    name: noEmptyStr("nom requis"),
    manager_id: z.union([nullString(),idSchema(), ]),
    address: z.string().transform(v=>v==""?null:v),
    city: z.string().transform(v=>v==""?null:v),
    postal_code: z.union([nullString(),postalSchema()]),
    phone: z.union([nullString(),phoneSchema()]),
    email: z.union([nullString(),z.email()]),
    is_active: z.boolean(),
  });

  export type StoreFormOutput = z.infer<typeof storeFormSchema>;
  export type StoreFormValues = z.input<typeof storeFormSchema>;
