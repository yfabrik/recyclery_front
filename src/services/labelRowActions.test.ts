import { describe, expect, it } from "vitest";
import { labelRowActions } from "./labelRowActions";

describe("labelRowActions", () => {
  it("keeps every action on an available item", () => {
    expect(labelRowActions({ status: "available", sale_id: null })).toEqual([
      { type: "print" },
      { type: "edit" },
      { type: "markSold" },
      { type: "delete" },
    ]);
  });

  it("offers only Print and the Sale on an item sold through a Sale", () => {
    expect(labelRowActions({ status: "sold", sale_id: 42 })).toEqual([
      { type: "print" },
      { type: "viewSale", saleId: 42 },
    ]);
  });

  it("offers only Print on an item marked sold by hand", () => {
    expect(labelRowActions({ status: "sold", sale_id: null })).toEqual([
      { type: "print" },
    ]);
  });

  it("never offers Edit or Delete on a sold item", () => {
    for (const sale_id of [null, 7]) {
      const types = labelRowActions({ status: "sold", sale_id }).map(
        (action) => action.type,
      );
      expect(types).not.toContain("edit");
      expect(types).not.toContain("delete");
    }
  });

});
