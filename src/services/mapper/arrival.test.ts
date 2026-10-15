import { describe, expect, it } from "vitest";
import type { ArrivalFilterFormValues } from "../schema/arrival";
import { toArrivalQuery } from "./arrival";

const base: ArrivalFilterFormValues = {
  date_from: "2026-10-01",
  date_to: "2026-10-15",
  category_id: "",
  source_type: "",
  collection_point_id: "",
};

describe("toArrivalQuery", () => {
  it("omits the blank sentinels and keeps the dates", () => {
    expect(toArrivalQuery(base)).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-15",
    });
  });

  it("forwards source_type and collection_point_id when set", () => {
    expect(
      toArrivalQuery({ ...base, source_type: "point", collection_point_id: 7 }),
    ).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-15",
      source_type: "point",
      collection_point_id: 7,
    });
  });

  it("forwards category_id when set", () => {
    expect(toArrivalQuery({ ...base, category_id: 3 })).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-15",
      category_id: 3,
    });
  });

  it("never sends form-only keys", () => {
    expect(Object.keys(toArrivalQuery({ ...base, source_type: "point" })).sort())
      .toEqual(["date_from", "date_to", "source_type"]);
  });
});
