import type { CsvColumn } from "../../../utils/csv";

/**
 * Looks up a row's counterpart in the comparison range by key (a Store id, a
 * category id, a discount key): `undefined` when there is no comparison
 * range, or no such row in it.
 */
export const comparisonLookup = <T, K>(
  comparison: readonly T[] | null | undefined,
  keyOf: (row: T) => K,
) => {
  const byKey = new Map(comparison?.map((row) => [keyOf(row), row] as const));
  return (key: K): T | undefined => byKey.get(key);
};

/** A section's CSV columns, then its comparison columns when there is a comparison range. */
export const csvColumns = <T>(
  columns: CsvColumn<T>[],
  comparisonColumns: CsvColumn<T>[],
  hasComparison: boolean,
): CsvColumn<T>[] => (hasComparison ? [...columns, ...comparisonColumns] : columns);
