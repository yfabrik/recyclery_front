import { describe, expect, it } from "vitest";
import type {
  SaleFilterFormValues,
  SaleHistoryFilterFormValues,
} from "../schema/sale";
import { toSaleHistoryQuery, toSaleQuery, toSaleStatsQuery } from "./sale";

const sale: SaleFilterFormValues = {
  store_id: "",
  period: "month",
  date_from: "2026-10-01",
  date_to: "2026-10-15",
  transaction_number: "42",
};

const history: SaleHistoryFilterFormValues = {
  date_from: "2026-10-01",
  date_to: "2026-10-15",
  transaction_number: "",
  transactionType: "",
  transactionMethod: "",
};

describe("toSaleQuery", () => {
  it("omits a blank store and never forwards transaction_number", () => {
    expect(toSaleQuery(sale)).toEqual({
      period: "month",
      date_from: "2026-10-01",
      date_to: "2026-10-15",
    });
  });

  it("forwards the store when selected", () => {
    expect(toSaleQuery({ ...sale, store_id: 2 })).toMatchObject({ store_id: 2 });
  });
});

describe("toSaleStatsQuery", () => {
  it("only sends the keys the stats endpoints accept", () => {
    expect(Object.keys(toSaleStatsQuery({ ...sale, store_id: 2 })).sort()).toEqual([
      "date_from",
      "date_to",
      "store_id",
    ]);
  });
});

describe("toSaleHistoryQuery", () => {
  it("omits blank sentinels", () => {
    expect(toSaleHistoryQuery(history)).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-15",
    });
  });

  it("renames the form-only keys to API params and does not leak them", () => {
    const query = toSaleHistoryQuery({
      ...history,
      transaction_number: "42",
      transactionType: "refund",
      transactionMethod: "card",
    });
    expect(query).toEqual({
      date_from: "2026-10-01",
      date_to: "2026-10-15",
      transaction_number: "42",
      type: "refund",
      payment_method: "card",
    });
    expect(query).not.toHaveProperty("transactionType");
    expect(query).not.toHaveProperty("transactionMethod");
  });
});
