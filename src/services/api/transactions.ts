import type { AxiosResponse } from "axios";
import type {
  RefundData,
  SaleTransactionBase,
  TransactionListFilter,
  transactionStatsFilterSchema,
} from "@recyclerie/api/schemas/salesTransactions";
import type * as z from "zod";
import type {
  ListSalesTransactionsResponse,
  DetailSalesTransactionResponse,
  CreateSalesTransactionResponse,
  CreateRefundResponse,
  ListRefundsResponse,
  SalesTransactionStatsResponse,
  PostalCodeStatsResponse,
  UpdateSalesTransactionResponse,
  DeleteSalesTransactionResponse,
  SalesTransactionDto,
} from "@recyclerie/api/responses/salesTransactions";
import axiosInstance from "./axios";

export type { SalesTransactionDto };

export type transactionsFilters = Partial<TransactionListFilter> & {
  page?: number;
};

export type CreateTransactionBody = SaleTransactionBase & {
  payment_method?: Exclude<SalesTransactionDto["payment_method"], "mixed" | "giftcard">;
  payment_amount?: number;
};

export type UpdateTransactionBody = CreateTransactionBody;
export type CreateRefundBody = RefundData;

type TransactionStatsFilter = z.infer<typeof transactionStatsFilterSchema>;

export type TransactionDetailsModel = SalesTransactionDto;
export type RefundTransaction = SalesTransactionDto;

export type { CreateSalesTransactionResponse } from "@recyclerie/api/responses/salesTransactions";

export const getTransactions = (
  filters: transactionsFilters | null = null,
): Promise<AxiosResponse<ListSalesTransactionsResponse>> =>
  axiosInstance.get<ListSalesTransactionsResponse>("/api/sales-transactions", {
    params: { ...filters, include: filters?.include?.toString() },
  });

export const getTranscationStats = (
  filters: Partial<TransactionStatsFilter> | null = null,
): Promise<AxiosResponse<SalesTransactionStatsResponse>> =>
  axiosInstance.get<SalesTransactionStatsResponse>(
    "/api/sales-transactions/stats/summary",
    { params: filters },
  );

export const getTranscationPostalStats = (
  filters: Partial<TransactionStatsFilter> | null = null,
): Promise<AxiosResponse<PostalCodeStatsResponse>> =>
  axiosInstance.get<PostalCodeStatsResponse>(
    "/api/sales-transactions/stats/postal-codes",
    { params: filters },
  );

export const createRefund = (
  id: number,
  data: CreateRefundBody,
): Promise<AxiosResponse<CreateRefundResponse>> =>
  axiosInstance.post<CreateRefundResponse>(
    `/api/sales-transactions/${id}/refunds`,
    data,
  );

export const getRefundForTransaction = (
  id: number,
): Promise<AxiosResponse<ListRefundsResponse>> =>
  axiosInstance.get<ListRefundsResponse>(
    `/api/sales-transactions/${id}/refunds`,
  );

export const createSell = (
  data: CreateTransactionBody,
): Promise<AxiosResponse<CreateSalesTransactionResponse>> =>
  axiosInstance.post<CreateSalesTransactionResponse>(
    "/api/sales-transactions",
    data,
  );

export const updateTransaction = (
  id: number,
  data: UpdateTransactionBody,
): Promise<AxiosResponse<UpdateSalesTransactionResponse>> =>
  axiosInstance.put<UpdateSalesTransactionResponse>(
    `/api/sales-transactions/${id}`,
    data,
  );

export const getTransactionDetails = (
  id: number,
): Promise<AxiosResponse<DetailSalesTransactionResponse>> =>
  axiosInstance.get<DetailSalesTransactionResponse>(
    `/api/sales-transactions/${id}`,
  );

export const deleteTransaction = (
  id: number,
): Promise<AxiosResponse<DeleteSalesTransactionResponse>> =>
  axiosInstance.delete<DeleteSalesTransactionResponse>(
    `/api/sales-transactions/${id}`,
  );
