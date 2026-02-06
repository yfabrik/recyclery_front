import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { CaisseModel, StoreModel } from "../../interfaces/Models";
import type { Schema } from "../../components/forms/StoreForm";

interface StoreFilters {
  active?: boolean;
  include?: Array<"employees" | "caisses" | "manager" | "horaires"> | string;
}

export const fetchStores = (filters?: StoreFilters): Promise<AxiosResponse<{ message: string, stores: StoreModel[] }>> => {
  if (filters?.include)
    filters = { ...filters, include: filters.include.toString() }

  return axiosInstance.get("/api/recycleries", { params: filters });

}

export const updateStore = (id: number, data: Schema) =>
  axiosInstance.put(`/api/stores/${id}`, data);

export const createStore = (data: Schema) => axiosInstance.post("/api/stores", data);

export const deleteStore = (id: number) =>
  axiosInstance.delete(`/api/stores/${id}`);

export const fetchCaisses = (storeId: number): Promise<AxiosResponse<{ message: string, cash_registers: CaisseModel[] }>> =>
  axiosInstance.get(`/api/stores/${storeId}/cash-registers`);

export const createCaisse = (storeId: number, data: { name: string }) =>
  axiosInstance.post(`/api/stores/${storeId}/cash-registers`, data);

export const fetchCaisses2 = (storeId: number) =>
  axiosInstance.get(`/api/cash-registers/store/${storeId}`); //TODO store en param

export const updateCaisse = (id: number, data) =>
  axiosInstance.put(`/api/cash-registers/${id}`, data);
export const createCaisse2 = (data) =>
  axiosInstance.post("/api/cash-registers", data);
export const getActiveCaisses = () =>
  axiosInstance.get("/api/cash-sessions/active"); //TODO params
export const deleteCaisse = (id: number) =>
  axiosInstance.delete(`/api/cash-registers/${id}`);

export const OpenCaisse = (data) =>
  axiosInstance.post("/api/cash-sessions/open", data);
export const closeCaisse = (id: number, data) =>
  axiosInstance.put(`/api/cash-sessions/${id}/close`, data);

