import z from "zod";
import { idSchema, nullString, postalSchema } from "../../interfaces/ZodTypes";
import {
  formatCurrency,
  getCartTotalWithGlobalPromotion,
  isPaymentInsufficient,
  roundCurrency,
} from "../../services/cartService";

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
  global_promotion: z.object({
    type: z.enum(["percent", "fixed"]),
    value: z.coerce.number().nonnegative(),
  }),
  payment_splits: z.array(
    z.object({
      method: z.enum(["cash", "card", "check", "giftcard","transfer"]),
      amount: z.coerce.number().nonnegative(),
      gift_card_barcode: z.string().optional(),
      gift_card_id: z.number().optional(),
      gift_card_current_value: z.number().optional(),
    }),
  ).min(1, "au moins un mode de paiement est requis"),//TODO filter line with amount = 0 ? or just make amount positive ?
  customer_postal_code: z.union([postalSchema("format invalide"), nullString()])
}).superRefine((data, ctx) => {


  const totalCart = getCartTotalWithGlobalPromotion(data.cart, data.global_promotion);
  const totalPaid = data.payment_splits.reduce((sum, split) => sum + split.amount, 0);
  if (isPaymentInsufficient(totalPaid, totalCart)) {
    ctx.addIssue({
      code: "too_small",
      minimum: roundCurrency(totalCart),
      origin: "number",
      path: ["payment_splits"],
      message: `Le montant payé ne peut pas être inférieur au total du panier (${formatCurrency(roundCurrency(totalCart))})`,
    });
  }
});

export type Schema = z.infer<typeof schema>;
export type CartFormValues = z.input<typeof schema>;
export type CartItemInput = z.input<typeof itemSchema>;
export type CartItem = z.infer<typeof itemSchema>
// export type CartItem = Schema["cart"][number];
