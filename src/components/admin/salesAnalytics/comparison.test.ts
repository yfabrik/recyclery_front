import { describe, expect, it } from "vitest";
import type { CsvColumn } from "../../../utils/csv";
import { comparisonLookup, csvColumns } from "./comparison";

describe("comparisonLookup", () => {
  const stores = [
    { id: 1, net: 10 },
    { id: 2, net: 20 },
  ];

  it("finds the comparison row with the same key", () => {
    const before = comparisonLookup(stores, (s) => s.id);

    expect(before(2)).toEqual({ id: 2, net: 20 });
    expect(before(3)).toBeUndefined();
  });

  it("finds nothing without a comparison range", () => {
    expect(comparisonLookup<{ id: number }, number>(null, (s) => s.id)(1)).toBeUndefined();
  });
});

describe("csvColumns", () => {
  type Row = { a: number; b: number };
  const base: CsvColumn<Row>[] = [{ header: "A", key: "a" }];
  const comparison: CsvColumn<Row>[] = [{ header: "B", key: "b" }];

  it("adds the comparison columns only when there is a comparison range", () => {
    expect(csvColumns(base, comparison, true).map((c) => c.header)).toEqual(["A", "B"]);
    expect(csvColumns(base, comparison, false).map((c) => c.header)).toEqual(["A"]);
  });
});
