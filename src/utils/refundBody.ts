import type { RefundDataInput } from "@recyclerie/api/schemas/salesTransactions";
import type { Schema } from "../components/forms/RefundForm";
import type { CashSession } from "../interfaces/Models";
import { getCartLinePrice } from "../services/cartService";

export const buildCreateRefundBody = (
  data: Schema,
  cashSessionId: CashSession["id"],
): RefundDataInput => {
  const items = data.cart
    .map((item) => ({
      ...item,
      quantity: item.refundQuantity,
    }))
    .filter((item) => item.quantity > 0);

  const total_amount = items.reduce(
    (prev, current) => prev + getCartLinePrice(current),
    0,
  );

  return {
    items,
    total_amount,
    cash_session_id: cashSessionId,
    payment_method: data.refund_method,
    refund_reason: data.refund_reason,
    gift_card_code: data.gift_card_code,
  };
};
