import type { AxiosResponse } from "axios";
import type {
  ListStoreHoursResponse,
  CreateStoreHoursResponse,
  UpdateStoreHoursResponse,
} from "@recyclerie/api/responses/taskSchedule";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/StoreOpeningForm";

export type StoreHoursPayload = Omit<Schema, "notes"> & {
  notes: string | null;
};

export const fetchStoreHours = (): Promise<
  AxiosResponse<ListStoreHoursResponse>
> => axiosInstance.get<ListStoreHoursResponse>("/api/store-hours");

export const updateStoreHours = (
  id: number,
  data: StoreHoursPayload,
): Promise<AxiosResponse<UpdateStoreHoursResponse>> =>
  axiosInstance.put<UpdateStoreHoursResponse>(`/api/store-hours/${id}`, data);

export const createStoreHours = (
  data: StoreHoursPayload,
): Promise<AxiosResponse<CreateStoreHoursResponse>> =>
  axiosInstance.post<CreateStoreHoursResponse>("/api/store-hours", data);

export const deleteStoreHours = (id: number) =>
  axiosInstance.delete(`/api/store-hours/${id}`);
