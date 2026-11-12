import type {
  SalesCategoriesDto,
  SalesCategoryRowDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { describe, expect, it } from "vitest";
import {
  BAR_LABEL_PADDING,
  barLabelPlacement,
  categoriesCsv,
  categoryBars,
  categoryRows,
  fitBarLabel,
} from "./categories";

let nextId = 1;
const category = (
  name: string,
  net_revenue: number,
  quantity = 1,
  id: number | null = nextId++,
): SalesCategoryRowDto => ({
  category_id: id,
  name,
  has_subcategories: false,
  net_revenue,
  quantity,
  share: 0,
  average_price: quantity > 0 ? net_revenue / quantity : 0,
});

const dto = (categories: SalesCategoryRowDto[]): SalesCategoriesDto => ({
  path: [],
  net_revenue: categories.reduce((sum, c) => sum + c.net_revenue, 0),
  quantity: categories.reduce((sum, c) => sum + c.quantity, 0),
  categories,
});

/** Categories "C1" … "Cn" worth n×10 €, n×10 € − 10, … 10 €. */
const descending = (n: number) =>
  Array.from({ length: n }, (_, i) => category(`C${i + 1}`, (n - i) * 10));

const names = (bars: { name: string }[]) => bars.map((bar) => bar.name);

describe("categoryBars", () => {
  it("shows the top 10, then the rest as one Autres bar", () => {
    const bars = categoryBars(categoryRows(dto(descending(12)), null), "net_revenue");

    expect(names(bars)).toEqual([
      "C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10",
      "Autres (2 catégories)",
    ]);
    // 12 categories worth 780 €; the last two, 20 + 10 €.
    expect(bars[10]).toEqual({
      key: "others",
      name: "Autres (2 catégories)",
      value: 30,
      share: 30 / 780,
      row: null,
    });
    expect(bars[0]).toMatchObject({ name: "C1", value: 120, share: 120 / 780 });
  });

  it("groups even a single category beyond the 10th", () => {
    const bars = categoryBars(categoryRows(dto(descending(11)), null), "net_revenue");

    expect(bars).toHaveLength(11);
    expect(bars[10]).toMatchObject({ key: "others", name: "Autres (1 catégorie)", value: 10 });
  });

  it("shows every category when there are 10 or fewer", () => {
    const bars = categoryBars(categoryRows(dto(descending(10)), null), "net_revenue");

    expect(bars).toHaveLength(10);
    expect(bars.some((bar) => bar.row === null)).toBe(false);
    expect(categoryBars(categoryRows(dto(descending(3)), null), "net_revenue")).toHaveLength(3);
  });

  it("shows every category once Autres is opened", () => {
    const bars = categoryBars(categoryRows(dto(descending(15)), null), "net_revenue", {
      showAll: true,
    });

    expect(bars).toHaveLength(15);
    expect(bars.some((bar) => bar.row === null)).toBe(false);
  });

  it("sorts and sizes the bars by quantity on the quantity switch", () => {
    const rows = categoryRows(
      dto([category("Vaisselle", 50, 2), category("Livres", 10, 8), category("Textile", 30, 0)]),
      null,
    );

    const bars = categoryBars(rows, "quantity");

    expect(bars.map(({ name, value, share }) => ({ name, value, share }))).toEqual([
      { name: "Livres", value: 8, share: 0.8 },
      { name: "Vaisselle", value: 2, share: 0.2 },
      { name: "Textile", value: 0, share: 0 },
    ]);
  });

  it("leaves out the categories sold only in the comparison range", () => {
    const rows = categoryRows(
      dto([category("Vaisselle", 50, 2, 1)]),
      dto([category("Vaisselle", 40, 1, 1), category("Livres", 20, 4, 2)]),
    );

    expect(names(categoryBars(rows, "net_revenue"))).toEqual(["Vaisselle"]);
  });
});

describe("categoryRows", () => {
  it("pairs each category with its comparison figures, 0 where it sold nothing, and lists the ones sold only in the comparison range", () => {
    const rows = categoryRows(
      dto([category("Vaisselle", 50, 2, 1), category("Sans catégorie", 5, 1, null)]),
      dto([category("Vaisselle", 40, 1, 1), category("Livres", 20, 4, 2)]),
    );

    expect(
      rows.map((row) => ({
        name: row.name,
        inCurrent: row.inCurrent,
        current: row.current.net_revenue,
        comparison: row.comparison?.net_revenue,
      })),
    ).toEqual([
      { name: "Vaisselle", inCurrent: true, current: 50, comparison: 40 },
      { name: "Sans catégorie", inCurrent: true, current: 5, comparison: 0 },
      { name: "Livres", inCurrent: false, current: 0, comparison: 20 },
    ]);
  });

  it("has no comparison figures without a comparison range", () => {
    const rows = categoryRows(dto([category("Vaisselle", 50)]), null);

    expect(rows[0]?.comparison).toBeNull();
  });
});

describe("categoriesCsv", () => {
  it("writes each category with its share and change as percentages", () => {
    const rows = categoryRows(
      dto([{ ...category("Vaisselle", 49.5, 3, 1), share: 0.6, average_price: 16.5 }]),
      dto([category("Vaisselle", 40, 4, 1)]),
    );

    expect(categoriesCsv(rows).split("\r\n")).toEqual([
      "Catégorie,CA net,Quantité,Part du CA (%),Prix moyen,CA net comparaison,Évolution CA net (%),Quantité comparaison,Évolution quantité (%)",
      "Vaisselle,49.5,3,60,16.5,40,23.75,4,-25",
    ]);
  });

  it("has no comparison columns without a comparison range", () => {
    const rows = categoryRows(dto([category("Vaisselle", 40, 0, 1)]), null);

    expect(categoriesCsv(rows).split("\r\n")).toEqual([
      "Catégorie,CA net,Quantité,Part du CA (%),Prix moyen",
      "Vaisselle,40,0,0,0",
    ]);
  });
});

describe("barLabelPlacement", () => {
  const P = BAR_LABEL_PADDING;

  it("writes the label inside the bar, from its start, when it fits", () => {
    expect(barLabelPlacement({ start: 0, end: 300 }, 200, 1000)).toEqual({
      x: P,
      inside: true,
      room: 300 - 2 * P,
    });
  });

  it("writes it just after the bar's end when the bar is too short", () => {
    expect(barLabelPlacement({ start: 0, end: 120 }, 200, 1000)).toEqual({
      x: 120 + P,
      inside: false,
      room: 1000 - 120 - P,
    });
    expect(barLabelPlacement({ start: 0, end: 200 + P }, 200, 1000).inside).toBe(false);
  });

  it("starts from the left end of a negative bar and goes after its right end", () => {
    expect(barLabelPlacement({ start: 40, end: 100 }, 200, 1000)).toMatchObject({
      x: 100 + P,
      inside: false,
    });
    expect(barLabelPlacement({ start: 40, end: 400 }, 200, 1000)).toMatchObject({
      x: 40 + P,
      inside: true,
    });
  });

  it("takes the side with more room when the label fits on neither", () => {
    expect(barLabelPlacement({ start: 0, end: 250 }, 400, 300)).toEqual({
      x: P,
      inside: true,
      room: 250 - 2 * P,
    });
    expect(barLabelPlacement({ start: 0, end: 50 }, 400, 300)).toEqual({
      x: 50 + P,
      inside: false,
      room: 300 - 50 - P,
    });
  });
});

describe("fitBarLabel", () => {
  // 10 px a character.
  const width = (text: string) => text.length * 10;
  const figures = [" · 30 €", " · 5 %"];

  it("keeps the whole label when it fits", () => {
    expect(fitBarLabel("Vaisselle", figures, 300, width)).toBe("Vaisselle · 30 € · 5 %");
  });

  it("shortens the name first, keeping at least 7 letters", () => {
    expect(fitBarLabel("Vêtements et accessoires", figures, 230, width)).toBe(
      "Vêtements… · 30 € · 5 %",
    );
  });

  it("then drops the share, then the amount, before shortening the name further", () => {
    expect(fitBarLabel("Vêtements et accessoires", figures, 200, width)).toBe(
      "Vêtements et… · 30 €",
    );
    expect(fitBarLabel("Vaisselle", figures, 170, width)).toBe("Vaisselle · 30 €");
    expect(fitBarLabel("Vaisselle", figures, 50, width)).toBe("Vais…");
  });
});
