import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";

// =========================
// Shared GiftCard Types
// =========================

export type GiftCardStatus =
  | "active"
  | "partially_used"
  | "redeemed"
  | "expired"
  | "cancelled";

export type GiftCardDto = {
  id: number;
  code: string;
  initial_value: number | string;
  expires_at: string | Date | null;
  status: GiftCardStatus;
  currency: string;
  issued_at: string | Date;
  issued_transaction_id: number | null;
  issued_refund_transaction_id: number | null;
  created_by: number | null;
  note: string | null;
  recipient_name: string | null;
  recipient_email: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type GetGiftCardByCodeResponse = {
  success: true;
  data: GiftCardDto;
};

export type PaginationDto = {
  limit: number;
  offset: number;
  total: number;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
};

// =========================
// GET GiftCard by code
// GET /v1/gift-cards/code/:code
// =========================

export type GetGiftCardByCodeParams = {
  code: string;
};

export type GetGiftCardByCodeApiResponse =
  | GetGiftCardByCodeResponse
  | ApiErrorResponse;

// =========================
// CREATE GiftCard
// POST /v1/gift-cards
// =========================

export type CreateGiftCardRequestBody = {
  code: string;
  initial_value: number;
  expires_at?: string | Date | null;
  issued_transaction_id?: number | null;
  issued_refund_transaction_id?: number | null;
  note?: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreateGiftCardResponse = {
  success: true;
  message: string; // "Gift card creee"
  data: GiftCardDto;
};

export type CreateGiftCardApiResponse =
  | CreateGiftCardResponse
  | ApiErrorResponse;

// =========================
// GET GiftCards (list)
// GET /v1/gift-cards
// =========================

export type GetGiftCardsQuery = {
  status?: GiftCardStatus;
  code?: string;
  limit?: number;
  offset?: number;
};

export type GetGiftCardsResponse = {
  success: true;
  data: GiftCardDto[];
  pagination: PaginationDto;
};

export type GetGiftCardsApiResponse = GetGiftCardsResponse | ApiErrorResponse;

// =========================
// API functions
// =========================

export const getGiftCardByCode = (
  code: GetGiftCardByCodeParams["code"],
): Promise<AxiosResponse<GetGiftCardByCodeApiResponse>> =>
  // Keep current working path in your frontend; shape is aligned with your types.
  axiosInstance.get(`/api/gift-cards/code/${code}`);

export const listGiftCards = (
  query: GetGiftCardsQuery = {},
): Promise<AxiosResponse<GetGiftCardsApiResponse>> =>
  axiosInstance.get("/api/gift-cards", { params: query });

export const createGiftCard = (
  data: CreateGiftCardRequestBody,
): Promise<AxiosResponse<CreateGiftCardApiResponse>> =>
  axiosInstance.post("/api/gift-cards", data);

