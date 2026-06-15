import {
  DeleteSweep,
  EnergySavingsLeaf,
  Recycling,
  MoreHoriz,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { WasteModel } from "../interfaces/Models";

export type DisposalTypeValue = WasteModel["disposal_type"];

export type DisposalType = {
  [K in DisposalTypeValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[DisposalTypeValue];

function defineDisposalTypes<const T extends readonly DisposalType[]>(
  types: T & (DisposalTypeValue extends T[number]["value"] ? T : never),
): T {
  return types;
}

export const DISPOSAL_TYPES = defineDisposalTypes([
  {
    value: "eco_organism",
    label: "Éco-organisme",
    icon: <EnergySavingsLeaf />,
    color: "success",
  },
  {
    value: "landfill",
    label: "Déchetterie",
    icon: <DeleteSweep />,
    color: "warning",
  },
  {
    value: "recycling",
    label: "Recyclage",
    icon: <Recycling />,
    color: "info",
  },
  {
    value: "other",
    label: "Autre",
    icon: <MoreHoriz />,
    color: "default",
  },
] as const);

export const FORM_DISPOSAL_TYPES = DISPOSAL_TYPES.filter(
  (type) => type.value !== "recycling",
);

export const DISPOSAL_TYPE_FILTER_VALUES = [
  "eco_organism",
  "landfill",
  "other",
  "",
] as const;

export const getDisposalType = (value: string) =>
  DISPOSAL_TYPES.find((type) => type.value === value);

export const getDisposalTypeLabel = (type: DisposalTypeValue | string) =>
  getDisposalType(type)?.label ?? type;

export const getDisposalTypeColor = (
  type: DisposalTypeValue | string,
): NonNullable<ChipProps["color"]> =>
  getDisposalType(type)?.color ?? "default";
