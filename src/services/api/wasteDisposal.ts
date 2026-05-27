import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { WasteModel } from "../../interfaces/Models";
import type { Schema } from "../../components/forms/WasteForm";

export interface wasteFilter {
  category_id?: number,
  disposal_type?: string
  date_from?: Date
  date_to?: Date
}

interface WasteStats {
  "total_disposals": number, "total_weight_kg": number, "total_volume_m3": number, "total_transport_cost": number, "eco_organism_disposals": number, "landfill_disposals": number, "other_disposals": number
}
export const getWastes = (filters?: wasteFilter): Promise<AxiosResponse<{ message: string, disposals: WasteModel[], pagination: { page: number, limit: number, totalPages: number, total: number } }>> =>
  axiosInstance.get(`/api/waste-disposals`, { params: filters });

export const getWasteStats = (): Promise<AxiosResponse<{ stats: WasteStats }>> =>
  axiosInstance.get("/api/waste-disposals/stats/summary");

export const updateWaste = (id: number, data: Schema): Promise<AxiosResponse<{ message: string }>> =>
  axiosInstance.put(`/api/waste-disposals/${id}`, data);

export const createWaste = (data: Schema): Promise<AxiosResponse<{ message: string, disposal_id: number }>> =>
  axiosInstance.post("/api/waste-disposals", data);

export const deleteWaste = (id: number) => axiosInstance.delete(`/api/waste-disposals/${id}`)