import type { SalesStoreDto } from "@recyclerie/api/responses/salesAnalytics";
import { describe, expect, it } from "vitest";
import { storesCsv, toStoreRows } from "./stores";

const store = (
  store_id: number,
  name: string,
  figures: Partial<SalesStoreDto> = {},
): SalesStoreDto => ({
  store_id,
  name,
  is_active: true,
  net_revenue: 0,
  gross_revenue: 0,
  refunded_amount: 0,
  sales_count: 0,
  refund_count: 0,
  average_basket: 0,
  net_revenue_share: 0,
  ...figures,
});

const orgelet = store(1, "Orgelet", {
  net_revenue: 45,
  gross_revenue: 55,
  refunded_amount: 10,
  sales_count: 3,
  refund_count: 1,
  average_basket: 18.33,
  net_revenue_share: 0.5625,
});
const lons = store(2, "Lons", {
  net_revenue: 20,
  gross_revenue: 30,
  refunded_amount: 10,
  sales_count: 1,
  refund_count: 1,
  average_basket: 30,
  net_revenue_share: 0.25,
});
const clairvaux = store(3, "Clairvaux, ancien", {
  is_active: false,
  net_revenue: 15,
  gross_revenue: 15,
  sales_count: 1,
  average_basket: 15,
  net_revenue_share: 0.1875,
});

describe("toStoreRows", () => {
  it("gives each Store its net revenue change vs the same Store in the comparison range", () => {
    const rows = toStoreRows({
      current: { stores: [orgelet, lons] },
      comparison: {
        stores: [
          store(2, "Lons", { net_revenue: 25 }),
          store(1, "Orgelet", { net_revenue: 40 }),
        ],
      },
    });

    expect(rows.map((r) => [r.name, r.comparison_net_revenue, r.change])).toEqual([
      ["Orgelet", 40, { ratio: 0.125, direction: "up" }],
      ["Lons", 25, { ratio: -0.2, direction: "down" }],
    ]);
  });

  it("compares a Store missing from the comparison range with 0", () => {
    const [row] = toStoreRows({
      current: { stores: [clairvaux] },
      comparison: { stores: [orgelet] },
    });

    expect(row.comparison_net_revenue).toBe(0);
    expect(row.change).toEqual({ ratio: null, direction: "up" });
  });

  it("has no comparison and no change on compare=none", () => {
    const [row] = toStoreRows({ current: { stores: [orgelet] }, comparison: null });

    expect(row.comparison_net_revenue).toBeNull();
    expect(row.change).toBeNull();
  });
});

describe("storesCsv", () => {
  it("writes one line per Store with its figures, share and change in %", () => {
    const rows = toStoreRows({
      current: { stores: [orgelet, clairvaux] },
      comparison: { stores: [store(1, "Orgelet", { net_revenue: 40 })] },
    });

    expect(storesCsv(rows).split("\r\n")).toEqual([
      "Magasin,CA net,CA brut,Remboursé,Ventes,Panier moyen,Part du CA net (%),CA net comparaison,Évolution CA net (%)",
      "Orgelet,45,55,10,3,18.33,56.25,40,12.5",
      '"Clairvaux, ancien",15,15,0,1,15,18.75,0,',
    ]);
  });

  it("leaves out the comparison columns on compare=none", () => {
    const rows = toStoreRows({ current: { stores: [lons] }, comparison: null });

    expect(storesCsv(rows).split("\r\n")).toEqual([
      "Magasin,CA net,CA brut,Remboursé,Ventes,Panier moyen,Part du CA net (%)",
      "Lons,20,30,10,1,30,25",
    ]);
  });
});
