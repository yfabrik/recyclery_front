import { describe, expect, it } from "vitest";
import type { WasteFilterFormValues } from "../schema/waste";
import { toWasteQuery } from "./waste";

const base: WasteFilterFormValues = {
  category_id: "",
  disposal_type: "",
  date_from: "2026-10-01",
  date_to: "2026-10-15",
};

describe("toWasteQuery", () => {
  it("omits the blank sentinels and keeps the dates", () => {
    expect(toWasteQuery(base)).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-15",
    });
  });

  it("forwards category_id and disposal_type when set", () => {
    expect(
      toWasteQuery({ ...base, category_id: 3, disposal_type: "landfill" }),
    ).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-15",
      category_id: 3,
      disposal_type: "landfill",
    });
  });
});
