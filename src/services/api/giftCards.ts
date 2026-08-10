import type {
  CreateGiftCardMovementResponse,
  CreateGiftCardResponse,
  DetailGiftCardResponse,
  GiftCardBalanceResponse,
  ListGiftCardsResponse
} from "@recyclerie/api/responses/giftCards";
import type {
  GiftCardIssueInput,
  GiftCardListFilterInput,
  GiftCardMovementInput
} from "@recyclerie/api/schemas/giftCards";
import type { AxiosResponse } from "axios";
import type { GiftCardModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type GiftCardListFilter = z.infer<typeof giftCardListFilterSchema>;

// export type {
//   GiftCardBalanceDto, GiftCardDto, GiftCardIssueBody,
//   GiftCardMovementBody, GiftCardStatus
// };

// export type CreateGiftCardRequestBody = GiftCardIssueBody;

export const getGiftCardByCode = (
  code: GiftCardModel["code"],
): Promise<AxiosResponse<DetailGiftCardResponse>> =>
  axiosInstance.get<DetailGiftCardResponse>(`/api/gift-cards/code/${code}`);

export const listGiftCards = (
  filters?: GiftCardListFilterInput,
): Promise<AxiosResponse<ListGiftCardsResponse>> =>
  axiosInstance.get<ListGiftCardsResponse>("/api/gift-cards", {
    params: filters,
  });

export const createGiftCard = (
  data: GiftCardIssueInput,
): Promise<AxiosResponse<CreateGiftCardResponse>> =>
  axiosInstance.post<CreateGiftCardResponse>("/api/gift-cards", data);

export const getGiftCardBalance = (
  id: GiftCardModel["id"],
): Promise<AxiosResponse<GiftCardBalanceResponse>> =>
  axiosInstance.get<GiftCardBalanceResponse>(`/api/gift-cards/${id}/balance`);

export const chargeGiftCard = (
  id: GiftCardModel["id"],
  data: GiftCardMovementInput,
): Promise<AxiosResponse<CreateGiftCardMovementResponse>> =>
  axiosInstance.post<CreateGiftCardMovementResponse>(
    `/api/gift-cards/${id}/charge`,
    data,
  );

export const recreditGiftCard = (
  id: GiftCardModel["id"],
  data: GiftCardMovementInput,
): Promise<AxiosResponse<CreateGiftCardMovementResponse>> =>
  axiosInstance.post<CreateGiftCardMovementResponse>(
    `/api/gift-cards/${id}/recredit`,
    data,
  );

//TODO need a proper delete response ??
export const cancelGiftCard = (
  id: GiftCardModel["id"],
): Promise<AxiosResponse<DetailGiftCardResponse>> =>
  axiosInstance.delete<DetailGiftCardResponse>(`/api/gift-cards/${id}`);