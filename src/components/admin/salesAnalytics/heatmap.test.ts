import { getContrastRatio } from "@mui/material/styles";
import type { SalesHeatmapDto } from "@recyclerie/api/responses/salesAnalytics";
import { describe, expect, it } from "vitest";
import { getSalesAnalyticsFilterDefaults, toSalesAnalyticsQuery } from "./filters";
import {
  cellIntensity,
  heatmapCellColors,
  heatmapCellLabel,
  heatmapFilters,
  heatmapMax,
} from "./heatmap";

/** Monday 10h: 120 € over 3 Sales; Saturday 10h: 300 € over 2; Saturday 14h: a Refund only. */
const HEATMAP: SalesHeatmapDto = {
  hours: [10, 14],
  rows: [
    {
      weekday: 1,
      cells: [
        { hour: 10, net_revenue: 120, sales_count: 3 },
        { hour: 14, net_revenue: 0, sales_count: 0 },
      ],
    },
    {
      weekday: 6,
      cells: [
        { hour: 10, net_revenue: 300, sales_count: 2 },
        { hour: 14, net_revenue: -15, sales_count: 0 },
      ],
    },
  ],
};

describe("heatmapMax", () => {
  it("is the largest net revenue or Sales count of the grid", () => {
    expect(heatmapMax(HEATMAP, "net_revenue")).toBe(300);
    expect(heatmapMax(HEATMAP, "sales_count")).toBe(3);
  });

  it("is 0 when no cell is positive", () => {
    const refundsOnly: SalesHeatmapDto = {
      hours: [14],
      rows: [{ weekday: 6, cells: [{ hour: 14, net_revenue: -15, sales_count: 0 }] }],
    };
    expect(heatmapMax(refundsOnly, "net_revenue")).toBe(0);
    expect(heatmapMax({ hours: [], rows: [] }, "net_revenue")).toBe(0);
  });
});

describe("cellIntensity", () => {
  it("leaves empty and negative cells untinted", () => {
    expect(cellIntensity(0, 300)).toBe(0);
    expect(cellIntensity(-15, 300)).toBe(0);
    expect(cellIntensity(10, 0)).toBe(0);
  });

  it("gives the max the full colour and a small value a visible tint", () => {
    expect(cellIntensity(300, 300)).toBe(1);
    expect(cellIntensity(1, 300)).toBeGreaterThan(0.1);
    expect(cellIntensity(120, 300)).toBeGreaterThan(cellIntensity(60, 300));
    expect(cellIntensity(120, 300)).toBeLessThan(1);
  });
});

describe("heatmapCellColors", () => {
  const light = { paper: "#fff", accent: "#2E7D32" };
  const dark = { paper: "#121212", accent: "#2E7D32" };
  const darkLighterAccent = { paper: "#121212", accent: "#66bb6a" };

  it("goes from the paper colour to the accent colour", () => {
    expect(heatmapCellColors(light, 0).background).toBe("rgb(255, 255, 255)");
    expect(heatmapCellColors(light, 1).background).toBe("rgb(46, 125, 50)");
    expect(heatmapCellColors(dark, 0).background).toBe("rgb(18, 18, 18)");
  });

  it("keeps text readable (WCAG AA, 4.5:1) on every step of the scale, in light and dark mode", () => {
    for (const palette of [light, dark, darkLighterAccent]) {
      for (let step = 0; step <= 20; step++) {
        const { background, color } = heatmapCellColors(palette, step / 20);
        expect(getContrastRatio(color, background)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("heatmapCellLabel", () => {
  it("names the weekday and the Paris hour slot", () => {
    expect(heatmapCellLabel(1, 10)).toBe("Lundi 10h–11h");
    expect(heatmapCellLabel(0, 23)).toBe("Dimanche 23h–24h");
  });
});

describe("heatmapFilters", () => {
  it("queries without comparison, whatever the page compares with", () => {
    const filters = { ...getSalesAnalyticsFilterDefaults("2026-11-09"), compare: "last_year" as const };

    expect(toSalesAnalyticsQuery(heatmapFilters(filters))).toEqual({
      ...toSalesAnalyticsQuery(filters),
      compare: "none",
    });
  });
});
