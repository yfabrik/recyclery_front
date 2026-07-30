import { z } from "zod";
import { noEmptyStr } from "../../interfaces/ZodTypes";

export const categoryFormSchema = z.object({
  name: noEmptyStr("name required"),
  description: z.string(),
  icon: z.string(),
  defaultPrice: z.number().nonnegative(),
  defaultWeight: z.number().nonnegative(),
  parent_id: z.number().positive().nullable(),
  priceBasedOnWeight: z.boolean(),
  bundlePrice: z.union([z.literal(""), z.number("nombre attendu").nonnegative("le nombre doit etre positif")]),
  bundleQuantity: z.union([z.literal(""), z.number("nombre attendu").nonnegative("le nombre doit etre positif")]),
});

export type CategoryFormOutput = z.infer<typeof categoryFormSchema>;
export type CategoryFormValues = z.input<typeof categoryFormSchema>;
