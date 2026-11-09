import { describe, expect, it } from "vitest";
import {
  getSalesAnalyticsFilterDefaults,
  salesAnalyticsFilterSchema,
  toSalesAnalyticsQuery,
  toSaleFilterValues,
  type SalesAnalyticsFilters,
} from "./filters";

const filters: SalesAnalyticsFilters = {
  period: "quarter",
  date_from: "2026-10-01",
  date_to: "2026-11-09",
  store_id: "",
  compare: "previous",
  transaction_number: "42",
};

describe("getSalesAnalyticsFilterDefaults", () => {
  it("is the current month to date, all Stores, compared with last year", () => {
    expect(getSalesAnalyticsFilterDefaults("2026-11-09")).toEqual({
      period: "month",
      date_from: "2026-11-01",
      date_to: "2026-11-09",
      store_id: "",
      compare: "last_year",
      transaction_number: "",
    });
  });
});

describe("salesAnalyticsFilterSchema", () => {
  it("reads the URL params", () => {
    expect(
      salesAnalyticsFilterSchema.parse({
        ...getSalesAnalyticsFilterDefaults("2026-11-09"),
        period: "year",
        date_from: "2026-01-01",
        store_id: "3",
        compare: "none",
      }),
    ).toMatchObject({ period: "year", date_from: "2026-01-01", store_id: 3, compare: "none" });
  });
});

describe("toSalesAnalyticsQuery", () => {
  it("sends the period with the dates and the comparison, without a blank Store", () => {
    expect(toSalesAnalyticsQuery(filters)).toEqual({
      period: "quarter",
      date_from: "2026-10-01",
      date_to: "2026-11-09",
      compare: "previous",
    });
    expect(toSalesAnalyticsQuery({ ...filters, store_id: 2 })).toMatchObject({ store_id: 2 });
  });
});

describe("toSaleFilterValues", () => {
  it("is the former filter shape, with the transaction list's search", () => {
    expect(toSaleFilterValues({ ...filters, store_id: 2 })).toEqual({
      period: "custom",
      date_from: "2026-10-01",
      date_to: "2026-11-09",
      store_id: 2,
      transaction_number: "42",
    });
  });
});
