/** Coerce HTML number input values to form state (`"" | number`). */
export const parseHtmlNumberInput = (raw: string): "" | number =>
  raw === "" ? "" : Number(raw);
