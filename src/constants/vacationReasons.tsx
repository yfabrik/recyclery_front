import { BeachAccess, Healing, MoreHoriz } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { VacationReason } from "@recyclerie/api/enums";

export type VacationReasonValue = VacationReason;

export type VacationReasonOption = {
  [K in VacationReasonValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[VacationReasonValue];

function defineVacationReasons<
  const T extends readonly VacationReasonOption[],
>(
  reasons: T &
    (VacationReasonValue extends T[number]["value"] ? T : never),
): T {
  return reasons;
}

export const VACATION_REASONS = defineVacationReasons([
  {
    value: "paid_vacation",
    label: "Congé payé",
    icon: <BeachAccess />,
    color: "info",
  },
  {
    value: "sick",
    label: "Maladie",
    icon: <Healing />,
    color: "warning",
  },
  {
    value: "other",
    label: "Autre",
    icon: <MoreHoriz />,
    color: "default",
  },
] as const);

export const VACATION_REASON_VALUES = VACATION_REASONS.map(
  (reason) => reason.value,
) as [VacationReasonValue, ...VacationReasonValue[]];

export const getVacationReason = (value: string) =>
  VACATION_REASONS.find((reason) => reason.value === value);

export const getVacationReasonLabel = (
  reason: VacationReasonValue | string,
) => getVacationReason(reason)?.label ?? reason;

export const getVacationReasonColor = (
  reason: VacationReasonValue | string,
): NonNullable<ChipProps["color"]> =>
  getVacationReason(reason)?.color ?? "default";
