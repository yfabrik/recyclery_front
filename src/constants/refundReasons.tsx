import {
  AssignmentReturn,
  Build,
  HelpOutline,
  MoneyOff,
  SwapHoriz,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";

export type RefundReasonValue =
  | "customer_request"
  | "product_defect"
  | "wrong_product"
  | "overcharge"
  | "return_policy"
  | "other";

export type RefundReason = {
  [K in RefundReasonValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[RefundReasonValue];

function defineRefundReasons<const T extends readonly RefundReason[]>(
  reasons: T & (RefundReasonValue extends T[number]["value"] ? T : never),
): T {
  return reasons;
}

export const REFUND_REASONS = defineRefundReasons([
  {
    value: "customer_request",
    label: "Demande client",
    icon: <AssignmentReturn />,
    color: "info",
  },
  {
    value: "product_defect",
    label: "Produit défectueux",
    icon: <Build />,
    color: "warning",
  },
  {
    value: "wrong_product",
    label: "Mauvais produit",
    icon: <SwapHoriz />,
    color: "warning",
  },
  {
    value: "overcharge",
    label: "Surcharge",
    icon: <MoneyOff />,
    color: "error",
  },
  {
    value: "return_policy",
    label: "Politique de retour",
    icon: <AssignmentReturn />,
    color: "default",
  },
  {
    value: "other",
    label: "Autre",
    icon: <HelpOutline />,
    color: "default",
  },
] as const);

export const REFUND_REASON_VALUES = REFUND_REASONS.map(
  (reason) => reason.value,
) as [RefundReasonValue, ...RefundReasonValue[]];

export const getRefundReason = (value: string) =>
  REFUND_REASONS.find((reason) => reason.value === value);

export const getRefundReasonLabel = (reason?: string) =>
  reason ? (getRefundReason(reason)?.label ?? reason) : "—";

export const getRefundReasonColor = (
  reason: RefundReasonValue | string,
): NonNullable<ChipProps["color"]> =>
  getRefundReason(reason)?.color ?? "default";
