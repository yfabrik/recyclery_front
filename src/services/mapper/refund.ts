import type { RefundFormOutput } from "../schema/refund";

export type RefundFormPayload = {
  cart: RefundFormOutput["cart"];
  refund_reason: RefundFormOutput["refund_reason"];
  refund_method: RefundFormOutput["refund_method"];
  gift_card_code: string | null | undefined;
  notes: string;
};

export const refundPayloadFromForm = (
  data: RefundFormOutput,
): RefundFormPayload => ({
  cart: data.cart,
  refund_reason: data.refund_reason,
  refund_method: data.refund_method,
  gift_card_code:
    data.gift_card_code === "" || data.gift_card_code == null
      ? null
      : data.gift_card_code,
  notes: data.notes,
});
