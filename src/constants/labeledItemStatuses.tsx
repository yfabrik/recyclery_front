import { CheckCircle, Sell } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { LabeledItemModel } from "../interfaces/Models";

export type LabeledItemStatusValue = LabeledItemModel["status"];

export type LabeledItemStatus = {
  [K in LabeledItemStatusValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[LabeledItemStatusValue];

function defineLabeledItemStatuses<
  const T extends readonly LabeledItemStatus[],
>(statuses: T & (LabeledItemStatusValue extends T[number]["value"] ? T : never)): T {
  return statuses;
}

export const LABELED_ITEM_STATUSES = defineLabeledItemStatuses([
  {
    value: "available",
    label: "Disponible",
    icon: <CheckCircle />,
    color: "success",
  },
  {
    value: "sold",
    label: "Vendu",
    icon: <Sell />,
    color: "error",
  },
] as const);

export const LABELED_ITEM_STATUS_VALUES = [
  "available",
  "sold",
] as const satisfies readonly LabeledItemStatusValue[];

export const LABELED_ITEM_STATUS_FILTER_VALUES = [
  ...LABELED_ITEM_STATUS_VALUES,
  "",
] as const satisfies readonly (LabeledItemStatusValue | "")[];

export const getLabeledItemStatus = (value: string) =>
  LABELED_ITEM_STATUSES.find((status) => status.value === value);

export const getLabeledItemStatusLabel = (
  status: LabeledItemStatusValue | string,
) => getLabeledItemStatus(status)?.label ?? status;

export const getLabeledItemStatusColor = (
  status: LabeledItemStatusValue | string,
): NonNullable<ChipProps["color"]> =>
  getLabeledItemStatus(status)?.color ?? "default";
