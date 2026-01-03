import axiosInstance from "./axios";

interface transactionsFilters {
  store_id?: string;
  period?: string;
  date_from?: string;
  date_to?: string;
}

export const getTransactions = (filters: transactionsFilters | null = null) =>
  axiosInstance.get("/api/sales-transactions", { params: filters });

export const getTranscationStats = (
  filters: transactionsFilters | null = null
) =>
  axiosInstance.get("/api/sales-transactions/stats/summary", {
    params: filters,
  });

export const getTranscationPostalStats =( filters: transactionsFilters | null = null)=>axiosInstance.get(
        "/api/sales-transactions/stats/postal-codes",{params:filters})

export const createRefund = (data)=>axiosInstance.post(`/api/sales-transactions/refund`,data)

export const getRefundForTransaction=(id:number)=> axiosInstance.get(`/api/sales-transactions/${id}/refunds`)

export const createCreditNote = (data)=>axiosInstance.post(`/api/sales-transactions/credit-note`,data)

export const createSell = (data)=>axiosInstance.post('/api/sales-transactions',data)