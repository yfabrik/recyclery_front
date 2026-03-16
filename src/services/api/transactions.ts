import type { AxiosResponse } from "axios";
import type { TransactionModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

export interface transactionsFilters {
  store_id?: number;
  period?: string;
  date_from?: string;
  date_to?: string;
  session?: number;
  payment_method?: TransactionModel["payment_method"];
  page?: number;
  include: ("refund" | "items")[];
}
interface Stats {
  total_transactions: number;
  total_sales: number;
  total_sales_before_refunds: number;
  total_refunded: number;
  average_transaction: number;
  sessions_count: number;
  payment_methods: {
    count: number;
    payment_method: TransactionModel["payment_method"];
    total: number;
  }[];
  by_day: {
    date: string;
    transaction_count: number;
    total_amount: number;
  }[];
  by_category: {
    category_id: number;
    category_name: string;
    total_quantity: number;
    total_price_sum: number;
  }[];
}

export const getTransactions = (
  filters: transactionsFilters | null = null,
): Promise<
  AxiosResponse<{
    success: true;
    transactions: TransactionModel[];
    pagination: { limit: number; offset: number; total: number };
  }>
> =>
  axiosInstance.get("/api/sales-transactions", {
    params: { ...filters, include: filters?.include.toString() },
  });

export const getTranscationStats = (
  filters: transactionsFilters | null = null,
): Promise<AxiosResponse<{ stats: Stats }>> =>
  axiosInstance.get("/api/sales-transactions/stats/summary", {
    params: filters,
  });

export const getTranscationPostalStats = (
  filters: transactionsFilters | null = null,
): Promise<
  AxiosResponse<{
    postal_codes: {
      customer_postal_code: string;
      transaction_count: number;
      total_sales: number;
      average_transaction: number;
    }[];
  }>
> =>
  axiosInstance.get("/api/sales-transactions/stats/postal-codes", {
    params: filters,
  });

export const createRefund = (id, data) =>
  axiosInstance.post(`/api/sales-transactions/${id}/refunds`, data);

export const getRefundForTransaction = (
  id: number,
): Promise<AxiosResponse<{ success: true; refunds: TransactionModel[] }>> =>
  axiosInstance.get(`/api/sales-transactions/${id}/refunds`);

export const createCreditNote = (data) =>
  axiosInstance.post(`/api/sales-transactions/credit-note`, data);

export const createSell = (
  data: TransactionModel,
): Promise<
  AxiosResponse<{
    data: { id: number; message: string; sale: TransactionModel };
  }>
> => axiosInstance.post("/api/sales-transactions", data);
