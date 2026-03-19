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
  description: z.string().nullish(),
  weight: z.number(),
  promotion: z.number(),
  bundlePrice: z.number().nullish(),
  bundleQuantity: z.number().nullish(),
});

export const schema = z.object({
  cart: z.array(itemSchema).min(1, "le panier doit avoir au moins un article"),
  payment_splits: z.array(
    z.object({
      method: z.enum(["cash", "card", "check", "giftcard"]),
      amount: z.coerce.number().nonnegative(),
      gift_card_barcode: z.string().optional(),
      gift_card_id: z.number().optional(),
    }),
  ).min(1, "au moins un mode de paiement est requis"),
  customer_postal_code: z.union([postalSchema("format invalide"), nullString()])
}).superRefine((data, ctx) => {


  const totalCart = getCartTotal(data.cart)
  const totalPaid = data.payment_splits.reduce((sum, split) => sum + split.amount, 0);
  if (totalPaid < totalCart) {
    ctx.addIssue({
      code: "too_small",
      minimum: totalCart,
      origin: "number",
      path: ["payment_splits"],
      message: `Le montant payé ne peut pas être inférieur au total du panier (${totalCart.toFixed(2)}€)`,

    });
  }
});

export type Schema = z.infer<typeof schema>;
export type CartItem = z.infer<typeof itemSchema>
// export type CartItem = Schema["cart"][number];
