import z from "zod";
import { idSchema, nullString, postalSchema } from "../../interfaces/ZodTypes";
import { getCartTotal } from "../../services/cartService";

export const itemSchema = z.object({
  quantity: z.number().nonnegative(),
  price: z.number().nonnegative(),
  name: z.string(),
  category_name: z.string(),
  subcategory_name: z.string(),
  barcode: z.string(),
  category_id: idSchema(),
  subcategory_id: idSchema().nullish(),
  description: z.string(),
  weight: z.number(),
  promotion: z.number(),
  bundlePrice: z.number().nullish(),
  bundleQuantity: z.number().nullish(),
});

export const schema = z.object({
  cart: z.array(itemSchema).min(1, "le panier doit avoir au moins un article"),
  payment_method: z.enum(["cash", "card", "check"]),
  payment_amount: z
    .coerce.number(),
  customer_postal_code: z.union([postalSchema("format invalide"), nullString()])
}).superRefine((data, ctx) => {


  const totalCart = getCartTotal(data.cart)
  if (data.payment_amount < totalCart) {
    ctx.addIssue({
      code: "too_small",
      minimum: totalCart,
      origin: "number",
      path: ["payment_amount"],
      message: `Le montant payé ne peut pas être inférieur au total du panier (${totalCart.toFixed(2)}€)`,

    });
  }
});

export type Schema = z.infer<typeof schema>;
export type CartItem = z.infer<typeof itemSchema>
// export type CartItem = Schema["cart"][number];
