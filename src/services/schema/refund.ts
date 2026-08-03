import z from "zod";
import { REFUND_PAYMENT_METHODS } from "../../constants/paymentMethods";
import { REFUND_REASON_VALUES } from "../../constants/refundReasons";
import { itemSchema } from "./cart";

export const refundItemSchema = itemSchema.extend({
  refundQuantity: z.number(),
});

export type RefundItem = z.infer<typeof refundItemSchema>;

const REFUND_METHOD_VALUES = REFUND_PAYMENT_METHODS.map(
  (method) => method.value,
) as [
  (typeof REFUND_PAYMENT_METHODS)[number]["value"],
  ...(typeof REFUND_PAYMENT_METHODS)[number]["value"][],
];

const requiredSelect = <const T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) =>
  z
    .union([z.literal(""), z.enum(values)])
    .refine((v): v is T[number] => v !== "", { message });

export const refundFormSchema = z.object({
  cart: z.array(refundItemSchema),
  refund_reason: requiredSelect(REFUND_REASON_VALUES, "raison requis"),
  refund_method: requiredSelect(REFUND_METHOD_VALUES, "methode requis"),
  gift_card_code: z.string().optional(),
  notes: z.string(),
});

export type RefundFormValues = z.input<typeof refundFormSchema>;
export type RefundFormOutput = z.infer<typeof refundFormSchema>;
