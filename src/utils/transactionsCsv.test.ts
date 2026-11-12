import { describe, expect, it } from "vitest";
import type { TransactionModel } from "../interfaces/Models";
import type { transactionsFilters } from "../services/api/transactions";
import { fetchAllTransactions } from "./transactionsCsv";

const createdAt = "2026-10-05T10:00:00.000Z";

const transaction = (id: number, storeId: number): TransactionModel => ({
  id,
  createdAt,
  updatedAt: createdAt,
  total_amount: 10,
  total_amount_before_promotion: 10,
  payment_method: "cash",
  payment_amount: 10,
  transactionType: "sell",
  status: "completed",
  created_by: 1,
  cash_session_id: storeId,
  customer_name: null,
  customer_email: null,
  customer_postal_code: null,
  transactionId: null,
  global_promotion: null,
  global_promotion_type: null,
  CashSession: {
    id: storeId,
    createdAt,
    updatedAt: createdAt,
    opening_amount: 0,
    closing_amount: null,
    expected_amount: null,
    difference_amount: 0,
    status: "open",
    notes: null,
    closed_at: null,
    cash_register_id: storeId,
    user_id: 1,
    CashRegister: {
      id: storeId,
      name: `Caisse ${storeId}`,
      is_active: true,
      recyclery_id: storeId,
    },
  },
});

/** Stand-in for `GET /sales-transactions`: filters on the Store, two rows per page. */
const fakeListEndpoint =
  (rows: TransactionModel[]) => async (query: transactionsFilters) => {
    const matching = rows.filter(
      (row) =>
        query.store_id == null ||
        row.CashSession?.CashRegister?.recyclery_id === query.store_id,
    );
    const perPage = 2;
    const page = query.page ?? 1;
    const totalPages = Math.max(1, Math.ceil(matching.length / perPage));
    return {
      data: matching.slice((page - 1) * perPage, page * perPage),
      pagination: {
        page,
        perPage,
        total: matching.length,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  };

const ids = (rows: TransactionModel[]) => rows.map((row) => row.id);

describe("fetchAllTransactions", () => {
  it("returns the transactions of every page, not just the first", async () => {
    const rows = [1, 2, 3, 4, 5].map((id) => transaction(id, 1));

    const all = await fetchAllTransactions(
      {},
      { fetchPage: fakeListEndpoint(rows) },
    );

    expect(ids(all)).toEqual([1, 2, 3, 4, 5]);
  });

  it("applies the filters to every page", async () => {
    const rows = [
      transaction(1, 1),
      transaction(2, 2),
      transaction(3, 1),
      transaction(4, 2),
      transaction(5, 1),
    ];

    const all = await fetchAllTransactions(
      { store_id: 1 },
      { fetchPage: fakeListEndpoint(rows) },
    );

    expect(ids(all)).toEqual([1, 3, 5]);
  });

  it("drops the rows the caller does not keep", async () => {
    const rows = [1, 2, 3, 4].map((id) => transaction(id, 1));

    const all = await fetchAllTransactions(
      {},
      {
        fetchPage: fakeListEndpoint(rows),
        keep: (row) => row.id % 2 === 0,
      },
    );

    expect(ids(all)).toEqual([2, 4]);
  });
});
