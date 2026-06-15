import { Home, LocalShipping, VolunteerActivism } from "@mui/icons-material";
import type { ReactElement } from "react";
import type { ArrivalModel } from "../interfaces/Models";

export type ArrivalSourceTypeValue = ArrivalModel["source_type"];

export type ArrivalSourceType = {
  [K in ArrivalSourceTypeValue]: {
    value: K;
    label: string;
    icon: ReactElement;
  };
}[ArrivalSourceTypeValue];

function defineArrivalSourceTypes<const T extends readonly ArrivalSourceType[]>(
  sources: T & (ArrivalSourceTypeValue extends T[number]["value"] ? T : never),
): T {
  return sources;
}

export const ARRIVAL_SOURCE_TYPES = defineArrivalSourceTypes([
  {
    value: "point",
    label: "Point de Collecte",
    icon: <LocalShipping />,
  },
  {
    value: "apport",
    label: "Apport Volontaire",
    icon: <VolunteerActivism />,
  },
  {
    value: "house_clearance",
    label: "Vide Maison",
    icon: <Home />,
  },
] as const);

export const getArrivalSourceType = (value: string) =>
  ARRIVAL_SOURCE_TYPES.find((source) => source.value === value);

export const getArrivalSourceLabel = (sourceType: ArrivalSourceTypeValue | string) =>
  getArrivalSourceType(sourceType)?.label ?? sourceType;
