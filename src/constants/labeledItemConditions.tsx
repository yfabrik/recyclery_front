import {
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { ConditionState } from "@recyclerie/api/enums";

export type LabeledItemConditionValue = ConditionState;

export type LabeledItemCondition = {
  [K in LabeledItemConditionValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[LabeledItemConditionValue];

function defineLabeledItemConditions<
  const T extends readonly LabeledItemCondition[],
>(
  conditions: T &
    (LabeledItemConditionValue extends T[number]["value"] ? T : never),
): T {
  return conditions;
}

export const LABELED_ITEM_CONDITIONS = defineLabeledItemConditions([
  {
    value: "excellent",
    label: "Excellent",
    icon: <SentimentVerySatisfied />,
    color: "success",
  },
  {
    value: "good",
    label: "Bon état",
    icon: <SentimentSatisfied />,
    color: "primary",
  },
  {
    value: "fair",
    label: "État correct",
    icon: <SentimentNeutral />,
    color: "warning",
  },
  {
    value: "poor",
    label: "Mauvais état",
    icon: <SentimentDissatisfied />,
    color: "error",
  },
] as const);

export const LABELED_ITEM_CONDITION_VALUES = [
  "excellent",
  "good",
  "fair",
  "poor",
] as const satisfies readonly LabeledItemConditionValue[];

export const getLabeledItemCondition = (value: string) =>
  LABELED_ITEM_CONDITIONS.find((condition) => condition.value === value);

export const getLabeledItemConditionLabel = (
  condition: LabeledItemConditionValue | string,
) => getLabeledItemCondition(condition)?.label ?? condition;

export const getLabeledItemConditionColor = (
  condition: LabeledItemConditionValue | string,
): NonNullable<ChipProps["color"]> =>
  getLabeledItemCondition(condition)?.color ?? "default";
