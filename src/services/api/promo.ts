import type { AxiosResponse } from "axios";
import type { PromotionData } from "@recyclerie/api/schemas/promotions";
import type {
  ListPromotionsResponse,
  CreatePromotionResponse,
  UpdatePromotionResponse,
} from "@recyclerie/api/responses/promotions";
import axiosInstance from "./axios";

export type { PromotionData as PromoPayload };

export const listPromos = (): Promise<AxiosResponse<ListPromotionsResponse>> =>
  axiosInstance.get<ListPromotionsResponse>("/api/promotions");

export const createPromo = (
  data: PromotionData,
): Promise<AxiosResponse<CreatePromotionResponse>> =>
  axiosInstance.post<CreatePromotionResponse>("/api/promotions", data);

export const updatePromo = (
  id: number,
  data: PromotionData,
): Promise<AxiosResponse<UpdatePromotionResponse>> =>
  axiosInstance.put<UpdatePromotionResponse>(`/api/promotions/${id}`, data);
