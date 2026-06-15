import {
  AccountBalanceWallet,
  CardGiftcard,
  CreditCard,
  Payments,
  ReceiptLong,
  SwapHoriz,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { TransactionModel } from "../interfaces/Models";

export type PaymentMethodValue = TransactionModel["payment_method"];

export type PaymentMethod = {
  [K in PaymentMethodValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[PaymentMethodValue];

function definePaymentMethods<const T extends readonly PaymentMethod[]>(
  methods: T & (PaymentMethodValue extends T[number]["value"] ? T : never),
): T {
  return methods;
}

export const PAYMENT_METHODS = definePaymentMethods([
  {
    value: "cash",
    label: "Espèces",
    icon: <Payments />,
    color: "success",
  },
  {
    value: "card",
    label: "Carte bancaire",
    icon: <CreditCard />,
    color: "primary",
  },
  {
    value: "check",
    label: "Chèque",
    icon: <ReceiptLong />,
    color: "info",
  },
  {
    value: "giftcard",
    label: "Avoir",
    icon: <CardGiftcard />,
    color: "secondary",
  },
  {
    value: "mixed",
    label: "Mixte",
    icon: <AccountBalanceWallet />,
    color: "default",
  },
  {
    value: "transfer",
    label: "Virement",
    icon: <SwapHoriz />,
    color: "warning",
  },
] as const);

export const PAYMENT_METHOD_VALUES = PAYMENT_METHODS.map(
  (method) => method.value,
) as PaymentMethodValue[];

export const PAYMENT_METHOD_FILTER_VALUES = [
  ...PAYMENT_METHOD_VALUES,
  "",
] as const satisfies readonly (PaymentMethodValue | "")[];

export type PaymentMethodFilter =
  (typeof PAYMENT_METHOD_FILTER_VALUES)[number];

export const getPaymentMethod = (value: string) =>
  PAYMENT_METHODS.find((method) => method.value === value);

export const getPaymentMethodLabel = (method: PaymentMethodValue | string) =>
  getPaymentMethod(method)?.label ?? method;

export const getPaymentMethodColor = (
  method: PaymentMethodValue | string,
): NonNullable<ChipProps["color"]> =>
  getPaymentMethod(method)?.color ?? "default";

export const EDITABLE_PAYMENT_METHODS = PAYMENT_METHODS.filter(
  (method) => method.value !== "mixed",
);

export const POS_PAYMENT_METHODS = PAYMENT_METHODS.filter(
  (method) => method.value !== "mixed",
);

export const REFUND_PAYMENT_METHODS = PAYMENT_METHODS.filter(
  (method) => method.value !== "mixed",
);
