import { Lock, LockOpen } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { CashSession } from "../interfaces/Models";

export type CashSessionStatusValue = CashSession["status"];

export type CashSessionStatus = {
  [K in CashSessionStatusValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[CashSessionStatusValue];

function defineCashSessionStatuses<
  const T extends readonly CashSessionStatus[],
>(
  statuses: T &
    (CashSessionStatusValue extends T[number]["value"] ? T : never),
): T {
  return statuses;
}

export const CASH_SESSION_STATUSES = defineCashSessionStatuses([
  {
    value: "open",
    label: "Ouverte",
    icon: <LockOpen />,
    color: "success",
  },
  {
    value: "close",
    label: "Fermée",
    icon: <Lock />,
    color: "default",
  },
] as const);

export const CASH_SESSION_STATUS_VALUES = CASH_SESSION_STATUSES.map(
  (status) => status.value,
);

export const getCashSessionStatus = (value: string) =>
  CASH_SESSION_STATUSES.find((status) => status.value === value);

export const getCashSessionStatusLabel = (
  status: CashSessionStatusValue | string,
) => getCashSessionStatus(status)?.label ?? status;

export const getCashSessionStatusColor = (
  status: CashSessionStatusValue | string,
): NonNullable<ChipProps["color"]> =>
  getCashSessionStatus(status)?.color ?? "default";
