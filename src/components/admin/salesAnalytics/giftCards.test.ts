import type { GiftCardAnalyticsDto } from "@recyclerie/api/responses/giftCards";
import type { SalesAnalyticsDto } from "@recyclerie/api/responses/salesAnalytics";
import { describe, expect, it } from "vitest";
import { giftCardRows, giftCardsCsv, hasNoGiftCards } from "./giftCards";

const figures = (overrides: Partial<GiftCardAnalyticsDto> = {}): GiftCardAnalyticsDto => ({
  issued: {
    by_hand: { count: 1, amount: 30 },
    sold: { count: 1, amount: 20 },
    store_credit: { count: 2, amount: 18.5 },
    top_up: { count: 1, amount: 10 },
  },
  used: { count: 2, amount: 25 },
  expired: { count: 1, amount: 25 },
  outstanding: { count: 4, amount: 103 },
  ...overrides,
});

const response = (
  comparison: GiftCardAnalyticsDto | null,
): SalesAnalyticsDto<GiftCardAnalyticsDto> => ({
  ranges: {
    current: { date_from: "2024-02-01", date_to: "2024-02-29" },
    comparison: comparison && { date_from: "2023-02-01", date_to: "2023-02-28" },
  },
  current: figures(),
  comparison,
});

describe("giftCardRows", () => {
  it("lists the issued total, each origin, use, expiry and the balance at the end of the period", () => {
    const rows = giftCardRows(response(null), { storeSelected: false });

    expect(rows.map((r) => [r.label, r.count, r.amount])).toEqual([
      ["Émises", 5, 78.5],
      ["Créées à la main", 1, 30],
      ["Vendues en caisse", 1, 20],
      ["Avoirs sur remboursement", 2, 18.5],
      ["Recharges", 1, 10],
      ["Utilisées en paiement", 2, 25],
      ["Expirées", 1, 25],
      ["Solde restant au 29/02/2024", 4, 103],
    ]);
  });

  it("labels the network-wide lines 'tous magasins' only when a Store is selected", () => {
    const all = giftCardRows(response(null), { storeSelected: false });
    const one = giftCardRows(response(null), { storeSelected: true });

    expect(all.every((r) => r.scope === "")).toBe(true);
    expect(one.filter((r) => r.scope === "tous magasins").map((r) => r.label)).toEqual([
      "Créées à la main",
      "Expirées",
      "Solde restant au 29/02/2024",
    ]);
  });

  it("carries the comparison figures, none on compare=none", () => {
    const comparison = figures({ used: { count: 1, amount: 15 } });

    const used = giftCardRows(response(comparison), { storeSelected: false }).find(
      (r) => r.key === "used",
    );
    const usedWithout = giftCardRows(response(null), { storeSelected: false }).find(
      (r) => r.key === "used",
    );

    expect(used).toMatchObject({ comparisonCount: 1, comparisonAmount: 15 });
    expect(usedWithout).toMatchObject({ comparisonCount: null, comparisonAmount: null });
  });
});

describe("giftCardsCsv", () => {
  it("writes one row per line, with the comparison columns when there is a comparison", () => {
    const csv = giftCardsCsv(
      giftCardRows(response(figures()), { storeSelected: true }),
      { comparison: true },
    );

    const lines = csv.split("\r\n");
    expect(lines[0]).toBe(
      "Ligne,Magasins,Nombre,Montant (€),Nombre (comparaison),Montant (comparaison) (€)",
    );
    expect(lines[1]).toBe("Émises,,5,78.5,5,78.5");
    expect(lines[2]).toBe("Créées à la main,tous magasins,1,30,1,30");
    expect(lines).toHaveLength(9);
  });

  it("has no comparison columns on compare=none", () => {
    const csv = giftCardsCsv(giftCardRows(response(null), { storeSelected: false }), {
      comparison: false,
    });

    expect(csv.split("\r\n")[0]).toBe("Ligne,Magasins,Nombre,Montant (€)");
  });
});

describe("hasNoGiftCards", () => {
  const none = { count: 0, amount: 0 };
  const empty = figures({
    issued: { by_hand: none, sold: none, store_credit: none, top_up: none },
    used: none,
    expired: none,
    outstanding: none,
  });

  it("is true when nothing is issued, used, expired or left on cards", () => {
    expect(hasNoGiftCards(empty)).toBe(true);
  });

  it("is false when only a balance is left from earlier periods", () => {
    expect(hasNoGiftCards({ ...empty, outstanding: { count: 2, amount: 40 } })).toBe(false);
  });
});
