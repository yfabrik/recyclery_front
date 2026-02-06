import type { AxiosResponse } from "axios";
import type { EcoOrgModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/EcoOrganismForm";

interface EcoOrgFilters {
    active?: boolean
}

export const getEcoOrganisms = (filters?: EcoOrgFilters): Promise<AxiosResponse<{ message: string, eco_organisms: EcoOrgModel[] }>> => axiosInstance.get("/api/eco-organisms", { params: filters })

export const fetchEcoOrganismsStats = (): Promise<AxiosResponse<{ stats: { total_eco_organisms: number, active_eco_organisms: number, inactive_eco_organisms: number } }>> => axiosInstance.get("/api/eco-organisms/stats/summary")

export const createEcoOrganism = (data: Schema) => axiosInstance.post("/api/eco-organisms", data)
export const updateEcoOrganism = (id: number, data: Schema) => axiosInstance.put(`/api/eco-organisms/${id}`, data)
export const deleteEcoOrganism = (id: number) => axiosInstance.delete(`/api/eco-organisms/${id}`)