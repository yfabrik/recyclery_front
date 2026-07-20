import { WbSunny, WbTwilight } from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { TimeSlot } from "@recyclerie/api/enums";

export type WorkdayTimeSlotValue = TimeSlot;

export type WorkdayTimeSlot = {
  [K in WorkdayTimeSlotValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[WorkdayTimeSlotValue];

function defineWorkdayTimeSlots<const T extends readonly WorkdayTimeSlot[]>(
  slots: T & (WorkdayTimeSlotValue extends T[number]["value"] ? T : never),
): T {
  return slots;
}

export const WORKDAY_TIME_SLOTS = defineWorkdayTimeSlots([
  {
    value: "morning",
    label: "Matin",
    icon: <WbSunny />,
    color: "warning",
  },
  {
    value: "afternoon",
    label: "Après-midi",
    icon: <WbTwilight />,
    color: "info",
  },
] as const);

export const WORKDAY_TIME_SLOT_VALUES = [
  "morning",
  "afternoon",
] as const satisfies readonly WorkdayTimeSlotValue[];

export const ALLDAY_PRESENCE_SLOT = {
  value: "allday" as const,
  label: "Journée",
  color: "success" as NonNullable<ChipProps["color"]>,
  avatarColor: "#4caf50",
};

export const WORKDAY_TIME_SLOT_AVATAR_COLORS: Record<
  WorkdayTimeSlotValue,
  string
> = {
  morning: "#ff9800",
  afternoon: "#2196f3",
};

export const getWorkdayTimeSlot = (value: string) =>
  WORKDAY_TIME_SLOTS.find((slot) => slot.value === value);

export const getWorkdayTimeSlotLabel = (slot: WorkdayTimeSlotValue | string) =>
  getWorkdayTimeSlot(slot)?.label ?? slot;

export const getWorkdayTimeSlotColor = (
  slot: WorkdayTimeSlotValue | string,
): NonNullable<ChipProps["color"]> =>
  getWorkdayTimeSlot(slot)?.color ?? "default";

export const getWorkdayTimeSlotIcon = (slot: WorkdayTimeSlotValue | string) =>
  getWorkdayTimeSlot(slot)?.icon;
