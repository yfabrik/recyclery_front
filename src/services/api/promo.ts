import type { AxiosResponse } from "axios";
import type { PromotionData, PromotionDataInput } from "@recyclerie/api/schemas/promotions";
import type {
  ListPromotionsResponse,
  CreatePromotionResponse,
  UpdatePromotionResponse,
} from "@recyclerie/api/responses/promotions";
import axiosInstance from "./axios";
import type { PromoModel } from "../../interfaces/Models";

export type { PromotionData as PromoPayload };

export const listPromos = (): Promise<AxiosResponse<ListPromotionsResponse>> =>
  axiosInstance.get<ListPromotionsResponse>("/api/promotions");

export const createPromo = (
  data: PromotionDataInput,
): Promise<AxiosResponse<CreatePromotionResponse>> =>
  axiosInstance.post<CreatePromotionResponse>("/api/promotions", data);

export const updatePromo = (
  id: PromoModel["id"],
  data: PromotionDataInput,
): Promise<AxiosResponse<UpdatePromotionResponse>> =>
  axiosInstance.put<UpdatePromotionResponse>(`/api/promotions/${id}`, data);
