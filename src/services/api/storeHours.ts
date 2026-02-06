import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { StoreHoursModel } from "../../interfaces/Models";
import type { Schema } from "../../components/forms/StoreOpeningForm";

export const fetchStoreHours = (): Promise<AxiosResponse<{ message: string, storeHours: StoreHoursModel[] }>> => axiosInstance.get("/api/store-hours");
export const updateStoreHours = (id:number, data:Schema) =>
  axiosInstance.put(`/api/store-hours/${id}`, data);
export const createStoreHours = (data:Schema) =>
  axiosInstance.post("/api/store-hours", data);
export const deleteStoreHours = (id:number) =>
  axiosInstance.delete(`/api/store-hours/${id}`);
