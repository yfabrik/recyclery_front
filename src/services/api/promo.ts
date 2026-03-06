import type { AxiosResponse } from "axios";
import type { PromoModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/PromoForm";

interface PromoFilter {

}
export const listPromos = (filters?: PromoFilter): Promise<AxiosResponse<{ success: true, data: PromoModel[] }>> => axiosInstance.get("/api/promotions", filters)

export const createPromo = (data: Schema): Promise<AxiosResponse<{ success: true, message: string, data: PromoModel }>> => axiosInstance.post("/api/promotions", data)

export const updatePromo = (id: number, data: Schema): Promise<AxiosResponse<{ success: true, message: string, data: PromoModel }>> =>
    axiosInstance.put(`/api/promotions/${id}`, data);