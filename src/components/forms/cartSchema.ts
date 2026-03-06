import z from "zod";
import { idSchema } from "../../interfaces/ZodTypes";

export const itemSchema = z.object({
  quantity: z.number().nonnegative(),
  price: z.number().nonnegative(),
  name: z.string(),
  category_name: z.string(),
  subcategory_name: z.string(),
  // id: z.coerce.number().positive(),
  barcode: z.string(),
  category_id: idSchema(),
  subcategory_id: idSchema().nullish(),
  description: z.string(),
  weight: z.number(),
  promotion: z.number(),
  bundlePrice: z.number().nullish(),
  bundleQuantity: z.number().nullish(),
  // is_manual: z.boolean().default(false),
});

export const schema = z.object({
  cart: z.array(itemSchema),
});

export type Schema = z.infer<typeof schema>;
export type CartItem = z.infer<typeof itemSchema>
// export type CartItem = Schema["cart"][number];
