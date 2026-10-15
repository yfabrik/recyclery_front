import {
  DeleteSweep,
  EnergySavingsLeaf,
  Recycling,
  MoreHoriz,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import {
  WASTE_DISPOSAL_TYPES,
  type WasteDisposalType,
} from "@recyclerie/api/enums";

export type DisposalTypeValue = WasteDisposalType;

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

export const DISPOSAL_TYPE_FILTER_VALUES = [
  ...WASTE_DISPOSAL_TYPES,
  "",
] as const satisfies readonly (DisposalTypeValue | "")[];

export const getDisposalType = (value: string) =>
  DISPOSAL_TYPES.find((type) => type.value === value);

export const getDisposalTypeLabel = (type: DisposalTypeValue | string) =>
  getDisposalType(type)?.label ?? type;

export const getDisposalTypeColor = (
  type: DisposalTypeValue | string,
): NonNullable<ChipProps["color"]> =>
  getDisposalType(type)?.color ?? "default";
