import type {
  CreateRefundResponse,
  CreateSalesTransactionResponse,
  DeleteSalesTransactionResponse,
  DetailSalesTransactionResponse,
  ListRefundsResponse,
  ListSalesTransactionsResponse,
  PostalCodeStatsResponse,
  SalesTransactionStatsResponse,
  UpdateSalesTransactionResponse
} from "@recyclerie/api/responses/salesTransactions";
import type {
  RefundDataInput,
  SaleTransactionBaseInput,
  TransactionListFilter,
  TransactionListFilterInput,
  TransactionStatsFilterInput
} from "@recyclerie/api/schemas/salesTransactions";
import type { AxiosResponse } from "axios";
import type { TransactionModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type { SalesTransactionDto };

export type transactionsFilters = Omit<TransactionListFilterInput, "include"> & {
  include?: TransactionListFilter["include"];
  page?: number;
};

// export type CreateTransactionBody = SaleTransactionBase & {
//   payment_method?: Exclude<SalesTransactionDto["payment_method"], "mixed" | "giftcard">;
//   payment_amount?: number;
// };

// export type UpdateTransactionBody = CreateTransactionBody;
// export type CreateRefundBody = RefundData;

// type TransactionStatsFilter = z.infer<typeof transactionStatsFilterSchema>;

// export type TransactionDetailsModel = SalesTransactionDto;
// export type RefundTransaction = SalesTransactionDto;

// export type { CreateSalesTransactionResponse } from "@recyclerie/api/responses/salesTransactions";

export const getTransactions = (
  filters: transactionsFilters | null = null,
): Promise<AxiosResponse<ListSalesTransactionsResponse>> =>
  axiosInstance.get<ListSalesTransactionsResponse>("/api/sales-transactions", {
    params: { ...filters, include: filters?.include?.toString() },
  });

export const getTranscationStats = (
  filters: TransactionStatsFilterInput,
): Promise<AxiosResponse<SalesTransactionStatsResponse>> =>
  axiosInstance.get<SalesTransactionStatsResponse>(
    "/api/sales-transactions/stats/summary",
    { params: filters },
  );

export const getTranscationPostalStats = (
  filters: TransactionStatsFilterInput,
): Promise<AxiosResponse<PostalCodeStatsResponse>> =>
  axiosInstance.get<PostalCodeStatsResponse>(
    "/api/sales-transactions/stats/postal-codes",
    { params: filters },
  );

export const createRefund = (
  id: TransactionModel["id"],
  data: RefundDataInput,
): Promise<AxiosResponse<CreateRefundResponse>> =>
  axiosInstance.post<CreateRefundResponse>(
    `/api/sales-transactions/${id}/refunds`,
    data,
  );

export const getRefundForTransaction = (
  id: TransactionModel["id"],
): Promise<AxiosResponse<ListRefundsResponse>> =>
  axiosInstance.get<ListRefundsResponse>(
    `/api/sales-transactions/${id}/refunds`,
  );

export const createSell = (
  data: SaleTransactionBaseInput,
): Promise<AxiosResponse<CreateSalesTransactionResponse>> =>
  axiosInstance.post<CreateSalesTransactionResponse>(
    "/api/sales-transactions",
    data,
  );

export const updateTransaction = (
  id: TransactionModel["id"],
  data: SaleTransactionBaseInput,
): Promise<AxiosResponse<UpdateSalesTransactionResponse>> =>
  axiosInstance.put<UpdateSalesTransactionResponse>(
    `/api/sales-transactions/${id}`,
    data,
  );

export const getTransactionDetails = (
  id: TransactionModel["id"],
): Promise<AxiosResponse<DetailSalesTransactionResponse>> =>
  axiosInstance.get<DetailSalesTransactionResponse>(
    `/api/sales-transactions/${id}`,
  );

export const deleteTransaction = (
  id: TransactionModel["id"],
): Promise<AxiosResponse<DeleteSalesTransactionResponse>> =>
  axiosInstance.delete<DeleteSalesTransactionResponse>(
    `/api/sales-transactions/${id}`,
  );
