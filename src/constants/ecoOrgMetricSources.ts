import type { EcoOrgMetricSource } from "@recyclerie/api/enums";

export type EcoOrgMetricSourceValue = EcoOrgMetricSource;

export type EcoOrgMetricSourceOption = {
  [K in EcoOrgMetricSourceValue]: {
    value: K;
    label: string;
  };
}[EcoOrgMetricSourceValue];

function defineEcoOrgMetricSources<
  const T extends readonly EcoOrgMetricSourceOption[],
>(
  sources: T &
    (EcoOrgMetricSourceValue extends T[number]["value"] ? T : never),
): T {
  return sources;
}

export const ECO_ORG_METRIC_SOURCES = defineEcoOrgMetricSources([
  { value: "quarterIn", label: "Entrant" },
  { value: "quarterOut", label: "Sortant" },
  { value: "quarterSell", label: "Vendu" },
] as const);

export const getEcoOrgMetricSource = (value: string) =>
  ECO_ORG_METRIC_SOURCES.find((source) => source.value === value);

export const getEcoOrgMetricSourceLabel = (
  metricSource: EcoOrgMetricSourceValue | string,
) => getEcoOrgMetricSource(metricSource)?.label ?? metricSource;
