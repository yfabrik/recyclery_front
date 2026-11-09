export type Change = {
  /** (current − comparison) / |comparison|; null when the comparison value is 0. */
  ratio: number | null;
  direction: "up" | "down" | "flat";
};

/** Change of a figure vs the comparison range; null when there is no comparison. */
export const computeChange = (
  current: number,
  comparison: number | null | undefined,
): Change | null => {
  if (comparison == null) return null;
  const delta = current - comparison;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  if (comparison === 0) return { ratio: delta === 0 ? 0 : null, direction };
  return { ratio: delta / Math.abs(comparison), direction };
};

/** Colour of a change: a rise is good, unless lower is better (refunds). */
export const changeTone = (
  change: Change | null,
  { lowerIsBetter = false }: { lowerIsBetter?: boolean } = {},
): "success" | "error" | "neutral" => {
  if (!change || change.direction === "flat") return "neutral";
  return (change.direction === "up") !== lowerIsBetter ? "success" : "error";
};

const percent = new Intl.NumberFormat("fr-FR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

/** "+12,3 %", "−4,0 %", "0,0 %"; "—" when there is no ratio. */
export const formatChange = (change: Change) =>
  change.ratio == null ? "—" : percent.format(change.ratio);
