import type { TransactionModel } from "./Models";

export const PAYMENT_METHODS = [
  "cash",
  "card",
  "check",
  "giftcard",
  "mixed",
  "transfer",
] as const satisfies readonly TransactionModel["payment_method"][];

export const PAYMENT_METHOD_FILTER_VALUES = [
  ...PAYMENT_METHODS,
  "",
] as const satisfies readonly (TransactionModel["payment_method"] | "")[];

export const TRANSACTION_TYPES = [
  "sell",
  "refund",
] as const satisfies readonly TransactionModel["transactionType"][];

export const TRANSACTION_TYPE_FILTER_VALUES = [
  ...TRANSACTION_TYPES,
  "",
] as const satisfies readonly (TransactionModel["transactionType"] | "")[];

export type PaymentMethodFilter =
  (typeof PAYMENT_METHOD_FILTER_VALUES)[number];

export type TransactionTypeFilter =
  (typeof TRANSACTION_TYPE_FILTER_VALUES)[number];
