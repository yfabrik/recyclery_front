import z from "zod";
import { idSchema, nullString, postalSchema } from "../../interfaces/ZodTypes";

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
  cart: z.array(itemSchema),
  payment_method: z.enum(["cash", "card", "check"]),
  payment_amount: z
    .coerce.number(),//min =>sum cart

  customer_postal_code: z.union([postalSchema("format invalide"), nullString()])
}).superRefine((data, ctx) => {
  const getCartLinePrice = (line: CartItem): number => {

    let bundles = 0
    let extraItems = line.quantity
    if (line.bundleQuantity && line.bundleQuantity !== 0) {
      bundles = Math.trunc(line.quantity / line.bundleQuantity)
      extraItems = line.quantity % line.bundleQuantity
    }
    const sum = (price: number, quantity: number) => price * quantity * (1 - line.promotion / 100)
    return (
      sum(line.price, extraItems) + sum(line.bundlePrice || line.price, bundles)
    )
  }
  const totalCart = data.cart.reduce(
    (prev, current) =>
    (prev +=
      getCartLinePrice(current)),
    0,
  )
  if (data.payment_amount < totalCart) {
    ctx.addIssue({
      code: "too_small",
      minimum: totalCart,
      origin: "number",
      path: ["payment_amount"],
      message: `Le montant payé ne peut pas être inférieur au total du panier (${totalCart.toFixed(2)}€)`,

    });
  }
});;

export type Schema = z.infer<typeof schema>;
export type CartItem = z.infer<typeof itemSchema>
// export type CartItem = Schema["cart"][number];
