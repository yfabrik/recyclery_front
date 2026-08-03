import type { RefundDataInput } from "@recyclerie/api/schemas/salesTransactions";
import type { CashSession } from "../interfaces/Models";
import { getCartLinePrice } from "../services/cartService";
import { refundPayloadFromForm } from "../services/mapper/refund";
import type { RefundFormOutput } from "../services/schema/refund";

//TODO move to mapper ?
export const buildCreateRefundBody = (
  data: RefundFormOutput,
  cashSessionId: CashSession["id"],
): RefundDataInput => {
  const mapped = refundPayloadFromForm(data);
  const items = mapped.cart
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
    payment_method: mapped.refund_method,
    refund_reason: mapped.refund_reason,
    gift_card_code: mapped.gift_card_code,
  };
};
