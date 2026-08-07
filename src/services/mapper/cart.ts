import type {
  SaleTransactionBaseInput,
  TransactionItemInput,
} from "@recyclerie/api/schemas/salesTransactions";
import {
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  roundCurrency,
} from "../cartService";
import type { CartFormOutput } from "../schema/cart";
import { emptyToNull } from "../zodTransform";

interface BuildTransactionBodyOptions {
  normalizePostalCodeToNull?: boolean;
  includeTotalPrice?: boolean;
}

export const buildTransactionBody = (
  data: CartFormOutput,
  cashSessionId: number,
  {
    normalizePostalCodeToNull = true,
    includeTotalPrice = false,
  }: BuildTransactionBodyOptions = {},
): SaleTransactionBaseInput => {
  const subtotal = getCartTotal(data.cart);
  const total = getCartTotalWithGlobalPromotion(
    data.cart,
    data.global_promotion,
  );
  const paymentAmount = data.payment_splits.reduce(
    (sum, split) => sum + (Number(split.amount) || 0),
    0,
  );
  const nonZeroSplits = data.payment_splits.filter(
    (split) => Number(split.amount) > 0,
  );

  return {
    cash_session_id: cashSessionId,
    total_amount: roundCurrency(total),
    total_amount_before_promotion: roundCurrency(subtotal),
    global_promotion: Number(data.global_promotion.value) || 0,
    global_promotion_type: data.global_promotion.type,
    customer_postal_code:emptyToNull(data.customer_postal_code),
    payment_amount: roundCurrency(paymentAmount),
    payments: nonZeroSplits.map((split) => ({
      method: split.method,
      amount: Number(split.amount) || 0,
      gift_card_code: split.gift_card_barcode,
    })),
    items: data.cart.map((item) => {
      const baseItem = {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category_id: item.category_id as number,
        subcategory_id: item.subcategory_id as number | null | undefined,
        weight: item.weight,
        barcode: item.barcode,
        promotion: item.promotion,
        bundlePrice: item.bundlePrice,
        bundleQuantity: item.bundleQuantity,
      };

      if (!includeTotalPrice) return baseItem;

      return {
        ...baseItem,
        total_price: item.quantity * item.price,
      };
    }) satisfies TransactionItemInput["id"],
  };
};

export const buildUpdateTransactionBody = (
  data: CartFormOutput,
  cashSessionId: number,
): SaleTransactionBaseInput => {
  return buildTransactionBody(data, cashSessionId, {
    normalizePostalCodeToNull: true,
  }) satisfies SaleTransactionBaseInput;
};
