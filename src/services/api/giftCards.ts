import type { AxiosResponse } from "axios";
import type {
  GiftCardIssueBody,
  GiftCardMovementBody,
  giftCardListFilterSchema,
} from "@recyclerie/api/schemas/giftCards";
import type * as z from "zod";
import type {
  GiftCardDto,
  GiftCardBalanceDto,
  ListGiftCardsResponse,
  CreateGiftCardResponse,
  DetailGiftCardResponse,
  GiftCardBalanceResponse,
  CreateGiftCardMovementResponse,
} from "@recyclerie/api/responses/giftCards";
import type { GiftCardStatus } from "@recyclerie/api/enums";
import axiosInstance from "./axios";

export type GiftCardListFilter = z.infer<typeof giftCardListFilterSchema>;

export type {
  GiftCardDto,
  GiftCardBalanceDto,
  GiftCardStatus,
  GiftCardIssueBody,
  GiftCardMovementBody,
};

export type CreateGiftCardRequestBody = GiftCardIssueBody;

export const getGiftCardByCode = (
  code: string,
): Promise<AxiosResponse<DetailGiftCardResponse>> =>
  axiosInstance.get<DetailGiftCardResponse>(`/api/gift-cards/code/${code}`);

export const listGiftCards = (
  filters?: Partial<GiftCardListFilter>,
): Promise<AxiosResponse<ListGiftCardsResponse>> =>
  axiosInstance.get<ListGiftCardsResponse>("/api/gift-cards", {
    params: filters,
  });

export const createGiftCard = (
  data: GiftCardIssueBody,
): Promise<AxiosResponse<CreateGiftCardResponse>> =>
  axiosInstance.post<CreateGiftCardResponse>("/api/gift-cards", data);

export const getGiftCardBalance = (
  id: number,
): Promise<AxiosResponse<GiftCardBalanceResponse>> =>
  axiosInstance.get<GiftCardBalanceResponse>(`/api/gift-cards/${id}/balance`);

export const chargeGiftCard = (
  id: number,
  data: GiftCardMovementBody,
): Promise<AxiosResponse<CreateGiftCardMovementResponse>> =>
  axiosInstance.post<CreateGiftCardMovementResponse>(
    `/api/gift-cards/${id}/charge`,
    data,
  );

export const recreditGiftCard = (
  id: number,
  data: GiftCardMovementBody,
): Promise<AxiosResponse<CreateGiftCardMovementResponse>> =>
  axiosInstance.post<CreateGiftCardMovementResponse>(
    `/api/gift-cards/${id}/recredit`,
    data,
  );
