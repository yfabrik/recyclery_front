import { Cancel, CheckCircle, Schedule } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { DonationStatus as ApiDonationStatus } from "@recyclerie/api/enums";

export type DonationStatusValue = ApiDonationStatus;

export type DonationStatus = {
  [K in DonationStatusValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[DonationStatusValue];

function defineDonationStatuses<const T extends readonly DonationStatus[]>(
  statuses: T & (DonationStatusValue extends T[number]["value"] ? T : never),
): T {
  return statuses;
}

export const DONATION_STATUSES = defineDonationStatuses([
  {
    value: "pending",
    label: "En attente",
    icon: <Schedule />,
    color: "warning",
  },
  {
    value: "accepted",
    label: "Accepté",
    icon: <CheckCircle />,
    color: "success",
  },
  {
    value: "rejected",
    label: "Refusé",
    icon: <Cancel />,
    color: "error",
  },
] as const);

export const DONATION_STATUS_VALUES = DONATION_STATUSES.map(
  (status) => status.value,
);

export const getDonationStatus = (value: string) =>
  DONATION_STATUSES.find((status) => status.value === value);

export const getDonationStatusLabel = (status: DonationStatusValue | string) =>
  getDonationStatus(status)?.label ?? status;

export const getDonationStatusColor = (
  status: DonationStatusValue | string,
): NonNullable<ChipProps["color"]> =>
  getDonationStatus(status)?.color ?? "default";
