import { describe, expect, it } from "vitest";
import type { LabelFilterFormValues } from "../schema/label";
import { toLabeledItemQuery } from "./label";

const base: LabelFilterFormValues = {
  status: "",
  category_id: null,
  search: "",
  date_from: null,
  date_to: null,
};

describe("toLabeledItemQuery", () => {
  it("sends nothing when every filter is blank", () => {
    expect(toLabeledItemQuery(base)).toEqual({});
  });

  it("forwards only the filters that are set", () => {
    expect(
      toLabeledItemQuery({
        ...base,
        status: "sold",
        category_id: 4,
        search: "chaise",
        date_from: "2026-10-01",
      }),
    ).toEqual({
      status: "sold",
      category_id: 4,
      search: "chaise",
      date_from: "2026-10-01",
    });
  });
});
