import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { refreshSalesAnalytics, salesAnalyticsQueryKey } from "./queryKeys";

const query = { date_from: "2026-11-01", date_to: "2026-11-09", period: "month" };

describe("refreshSalesAnalytics", () => {
  it("invalidates every query of the page, and nothing else", async () => {
    const client = new QueryClient();
    const keys = {
      kpis: salesAnalyticsQueryKey("kpis", query),
      timeline: salesAnalyticsQueryKey("timeline", query),
      transactionList: ["transactions", query, 1],
      legacyPostalCodes: ["transactionsPostalStats", query],
      stores: ["stores", { active: true }],
    };
    for (const key of Object.values(keys)) client.setQueryData(key, {});

    await refreshSalesAnalytics(client);

    const invalidated = (key: readonly unknown[]) =>
      client.getQueryState(key)?.isInvalidated;
    expect(invalidated(keys.kpis)).toBe(true);
    expect(invalidated(keys.timeline)).toBe(true);
    expect(invalidated(keys.transactionList)).toBe(true);
    expect(invalidated(keys.legacyPostalCodes)).toBe(true);
    expect(invalidated(keys.stores)).toBe(false);
  });
});
