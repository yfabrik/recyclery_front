import { z } from "zod";
import { noEmptyStr, nullString } from "../../interfaces/ZodTypes";
import { idSchema } from "@recyclerie/api/primitives/zod";

export const categoryFormSchema = z.object({
  name: noEmptyStr("name required"),
  description: z.string().transform(v=>v==""?null:v),
  icon: z.string().transform(v=>v==""?null:v),
  defaultPrice: z.coerce.number().nonnegative().default(0),
  defaultWeight: z.coerce.number().nonnegative().default(0),
  parent_id: idSchema().nullable(),
  priceBasedOnWeight: z.boolean().default(false),
  bundlePrice: z.union([nullString(), z.coerce.number("nombre attendu").nonnegative("le nombre doit etre positif")]),
  bundleQuantity: z.union([nullString(), z.coerce.number("nombre attendu").nonnegative("le nombre doit etre positif")]),
});

export type CategoryFormOutput = z.infer<typeof categoryFormSchema>;
export type CategoryFormValues = z.input<typeof categoryFormSchema>;
