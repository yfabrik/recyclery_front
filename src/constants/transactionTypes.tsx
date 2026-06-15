import { PointOfSale, Undo } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { TransactionModel } from "../interfaces/Models";

export type TransactionTypeValue = TransactionModel["transactionType"];

export type TransactionType = {
  [K in TransactionTypeValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[TransactionTypeValue];

function defineTransactionTypes<const T extends readonly TransactionType[]>(
  types: T & (TransactionTypeValue extends T[number]["value"] ? T : never),
): T {
  return types;
}

export const TRANSACTION_TYPES = defineTransactionTypes([
  {
    value: "sell",
    label: "Vente",
    icon: <PointOfSale />,
    color: "success",
  },
  {
    value: "refund",
    label: "Remboursement",
    icon: <Undo />,
    color: "warning",
  },
] as const);

export const TRANSACTION_TYPE_VALUES = TRANSACTION_TYPES.map(
  (type) => type.value,
) as TransactionTypeValue[];

export const TRANSACTION_TYPE_FILTER_VALUES = [
  ...TRANSACTION_TYPE_VALUES,
  "",
] as const satisfies readonly (TransactionTypeValue | "")[];

export type TransactionTypeFilter =
  (typeof TRANSACTION_TYPE_FILTER_VALUES)[number];

export const getTransactionType = (value: string) =>
  TRANSACTION_TYPES.find((type) => type.value === value);

export const getTransactionTypeLabel = (type: TransactionTypeValue | string) =>
  getTransactionType(type)?.label ?? type;

export const getTransactionTypeColor = (
  type: TransactionTypeValue | string,
): NonNullable<ChipProps["color"]> =>
  getTransactionType(type)?.color ?? "default";
