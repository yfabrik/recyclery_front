import type {
  CreateStoreHoursResponse,
  ListStoreHoursResponse,
  UpdateStoreHoursResponse,
} from "@recyclerie/api/responses/taskSchedule";
import type { CreateStoreHoursDataInput } from "@recyclerie/api/schemas/schedules";
import type { AxiosResponse } from "axios";
import type { ScheduleModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type StoreHoursPayload = Omit<Schema, "notes"> & {
//   notes: string | null;
// };

export const fetchStoreHours = (): Promise<
  AxiosResponse<ListStoreHoursResponse>
> => axiosInstance.get<ListStoreHoursResponse>("/api/store-hours");

export const updateStoreHours = (
  id: ScheduleModel["id"],
  data: CreateStoreHoursDataInput,
): Promise<AxiosResponse<UpdateStoreHoursResponse>> =>
  axiosInstance.put<UpdateStoreHoursResponse>(`/api/store-hours/${id}`, data);

export const createStoreHours = (
  data: CreateStoreHoursDataInput,
): Promise<AxiosResponse<CreateStoreHoursResponse>> =>
  axiosInstance.post<CreateStoreHoursResponse>("/api/store-hours", data);

export const deleteStoreHours = (id: ScheduleModel["id"]) =>
  axiosInstance.delete(`/api/store-hours/${id}`);
