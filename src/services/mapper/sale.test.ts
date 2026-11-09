import { describe, expect, it } from "vitest";
import type {
  SaleFilterFormValues,
  SaleHistoryFilterFormValues,
} from "../schema/sale";
import { toSaleHistoryQuery, toSaleQuery } from "./sale";

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
  it("forwards the transaction-number search with the period", () => {
    expect(toSaleQuery(sale)).toEqual({
      period: "month",
      date_from: "2026-10-01",
      date_to: "2026-10-15",
      transaction_number: "42",
    });
  });

  it("omits a blank store and a blank transaction-number search", () => {
    expect(toSaleQuery({ ...sale, transaction_number: "" })).toEqual({
      period: "month",
      date_from: "2026-10-01",
      date_to: "2026-10-15",
    });
  });

  it("forwards the store when selected", () => {
    expect(toSaleQuery({ ...sale, store_id: 2 })).toMatchObject({ store_id: 2 });
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
