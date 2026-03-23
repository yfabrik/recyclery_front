import type { AxiosResponse } from "axios";
import type { TransactionModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { APIResponse } from "./types";

export interface transactionsFilters {
  store_id?: number;
  period?: string;
  date_from?: string;
  date_to?: string;
  session?: number;
  payment_method?: TransactionModel["payment_method"];
  page?: number;
  include?: ("refund" | "items")[];
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

// Shared
type PaymentMethod = "cash" | "card" | "check" | "giftcard";

type CartItemInput = {
  name: string;
  price: number;
  quantity?: number; // default 1
  category_id: number;
  subcategory_id?: number | null;
  weight: number;
  barcode: string; // numeric => existing labeled item, non-numeric => create sold item row
  promotion?: number | null; // 0..100
  bundlePrice?: number | null;
  bundleQuantity?: number | null;
};

type PaymentLineInput = {
  method: PaymentMethod;
  amount: number; // > 0
  gift_card_code?: string | null; // required when method === "giftcard"
};

// -----------------------------
// createTransaction request body
// -----------------------------
export type CreateTransactionBody = {
  cash_session_id: number;
  total_amount: number;
  customer_postal_code?: string | null;
  items: CartItemInput[];

  // New split-payment mode
  payments?: PaymentLineInput[];

  // Legacy fallback mode (still accepted when payments is omitted)
  payment_method?: Exclude<PaymentMethod, "giftcard">; // existing schema default: "cash"
  payment_amount?: number;
};

// Practical runtime rules currently enforced:
// - if payments provided: sum(payments.amount) === total_amount
// - every giftcard payment line must have gift_card_code
// - if payments missing, backend builds one line from payment_method/payment_amount

// -----------------------------
// createRefund request body
// -----------------------------
export type CreateRefundBody = {
  cash_session_id?: number | null;
  total_amount: number; // parsed but current logic recomputes from refundable lines
  payment_method?: PaymentMethod; // default "cash"
  gift_card_code?: string | null; // required when payment_method === "giftcard"
  refund_reason: string;
  items: CartItemInput[];
};

// Practical runtime rules currently enforced:
// - if payment_method === "giftcard", gift_card_code is required
// - refund amount used for recredit is computed from refundable items

// Reusable primitives
type PaymentMethodStored = PaymentMethod | "mixed";

type TransactionPaymentRow = {
  id: number;
  sales_transaction_id: number;
  method: PaymentMethod;
  amount: number | string; // DECIMAL in DB often serialized as string
  gift_card_id: number | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type TransactionItemRow = {
  id: number;
  transaction_id: number;
  labeled_item_id: number | null;
  name: string;
  price: number | string;
  quantity: number;
  promotionValue?: number | string;
  bundleQuantity?: number | null;
  bundlePrice?: number | string | null;
  total_price?: number | string; // virtual/computed in model
  createdAt: string;
  updatedAt: string;
};

type LabeledItemRow = {
  id: number;
  barcode?: string; // virtual in model
  name?: string | null;
  description?: string | null;
  price: number | string;
  weight?: number | string;
  status?: "available" | "sold";
  category_id?: number | null;
  subcategory_id?: number | null;
  recyclery_id?: number | null;
  created_by?: number | null;
  createdAt?: string;
  updatedAt?: string;
  TransactionItem?: TransactionItemRow; // when included through junction
};

type SalesTransactionRow = {
  id: number;
  total_amount: number | string | null;
  payment_method: PaymentMethodStored;
  payment_amount: number | string | null;
  transactionType: "sell" | "refund";
  customer_name?: string | null;
  customer_email?: string | null;
  customer_postal_code?: string | null;
  status: "pending" | "completed" | "cancelled";
  cash_session_id?: number | null;
  created_by?: number | null;
  transactionId?: number | null; // parent txn for refunds
  createdAt: string;
  updatedAt: string;

  // optional includes
  items?: LabeledItemRow[];
  refunds?: SalesTransactionRow[];
  payments?: TransactionPaymentRow[];
};

// Mirrors current "payments" echo in createTransaction response
type PaymentLineEcho = {
  method: PaymentMethod;
  amount: number;
  gift_card_code?: string | null;
};

// -----------------------------
// createTransaction response
// -----------------------------
export type CreateTransactionResponse = {
  success: true;
  data: {
    id: number;
    message: string; // "Transaction créée avec succès"
    sale: SalesTransactionRow;
    payments: PaymentLineEcho[];
  };
};

// -----------------------------
// createRefund response
// -----------------------------
export type CreateRefundResponse = {
  success: true;
  message: string; // "Remboursement créé avec succès"
  refund: SalesTransactionRow;
};

export const getTransactions = (
  filters: transactionsFilters | null = null,
): Promise<
  AxiosResponse<APIResponse<TransactionModel[]> & { transactions: TransactionModel[] }>
> =>
  axiosInstance.get("/api/sales-transactions", {
    params: { ...filters, include: filters?.include?.toString() },
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

export const createRefund = (id: number, data: CreateRefundBody): Promise<AxiosResponse<CreateRefundResponse>> =>
  axiosInstance.post(`/api/sales-transactions/${id}/refunds`, data);

export const getRefundForTransaction = (
  id: number,
): Promise<AxiosResponse<{ success: true; refunds: TransactionModel[] }>> =>
  axiosInstance.get(`/api/sales-transactions/${id}/refunds`);

// export const createCreditNote = (data) =>
//   axiosInstance.post(`/api/sales-transactions/credit-note`, data);

export const createSell = (
  data: CreateTransactionBody,
): Promise<
    AxiosResponse<CreateTransactionResponse>
> => axiosInstance.post("/api/sales-transactions", data);
