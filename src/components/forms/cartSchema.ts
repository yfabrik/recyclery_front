import z from "zod";

export const itemSchema = z.object({
  quantity: z.number(),
  price: z.number(),
  name: z.string(),
  category_name: z.string(),
  subcategory_name: z.string(),
  // id: z.coerce.number().positive(),
  barcode: z.string(),
  category_id: z.coerce.number().positive(),
  subcategory_id: z.coerce.number().positive().nullish(),
  description: z.string(),
  weight: z.number(),
  is_manual: z.boolean().default(false),
});

export const schema = z.object({
  cart: z.array(itemSchema),
});

export type Schema = z.infer<typeof schema>;
export type CartItem = Schema["cart"][number];
