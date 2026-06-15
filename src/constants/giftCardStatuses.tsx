import {
  Block,
  CardGiftcard,
  CheckCircle,
  HourglassEmpty,
  Timelapse,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { GiftCardStatus } from "../services/api/giftCards";

export type GiftCardStatusValue = GiftCardStatus;

export type GiftCardStatusOption = {
  [K in GiftCardStatusValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[GiftCardStatusValue];

function defineGiftCardStatuses<
  const T extends readonly GiftCardStatusOption[],
>(statuses: T & (GiftCardStatusValue extends T[number]["value"] ? T : never)): T {
  return statuses;
}

export const GIFT_CARD_STATUSES = defineGiftCardStatuses([
  {
    value: "active",
    label: "Actif",
    icon: <CheckCircle />,
    color: "success",
  },
  {
    value: "partially_used",
    label: "Partiellement utilisé",
    icon: <Timelapse />,
    color: "success",
  },
  {
    value: "redeemed",
    label: "Utilisé",
    icon: <CardGiftcard />,
    color: "info",
  },
  {
    value: "expired",
    label: "Expiré",
    icon: <HourglassEmpty />,
    color: "warning",
  },
  {
    value: "cancelled",
    label: "Annulé",
    icon: <Block />,
    color: "error",
  },
] as const);

export const GIFT_CARD_STATUS_VALUES = GIFT_CARD_STATUSES.map(
  (status) => status.value,
);

export const getGiftCardStatus = (value: string) =>
  GIFT_CARD_STATUSES.find((status) => status.value === value);

export const getGiftCardStatusLabel = (status: GiftCardStatusValue | string) =>
  getGiftCardStatus(status)?.label ?? status;

export const getGiftCardStatusColor = (
  status: GiftCardStatusValue | string,
): NonNullable<ChipProps["color"]> =>
  getGiftCardStatus(status)?.color ?? "default";

export const isGiftCardUnusable = (status: GiftCardStatusValue | string) =>
  status === "redeemed" || status === "expired" || status === "cancelled";
