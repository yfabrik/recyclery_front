import type {
  CreateCollectionPointPresenceResponse,
  DeleteTaskScheduleResponse,
  DetailTaskScheduleResponse,
  ListTaskSchedulesResponse,
  UpdateTaskScheduleResponse,
} from "@recyclerie/api/responses/taskSchedule";
import type { CreateCollectionPointPresenceDataInput } from "@recyclerie/api/schemas/schedules";
import type { AxiosResponse } from "axios";
import type { CollectionPointModel, ScheduleModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

export const fetchCollectionPointPresence = (): Promise<
  AxiosResponse<ListTaskSchedulesResponse>
> => axiosInstance.get<ListTaskSchedulesResponse>("/api/collection-point-presence");

export const fetchPresenceForPoint = (
  id: CollectionPointModel["id"],
): Promise<AxiosResponse<DetailTaskScheduleResponse>> =>
  axiosInstance.get<DetailTaskScheduleResponse>(
    `/api/collection-point-presence/collection-point/${id}`,
  );

export const createPointPresence = (
  data: CreateCollectionPointPresenceDataInput,
): Promise<AxiosResponse<CreateCollectionPointPresenceResponse>> =>
  axiosInstance.post<CreateCollectionPointPresenceResponse>(
    "/api/collection-point-presence",
    data,
  );

export const updatePointPresence = (
  id: ScheduleModel["id"],
  data: CreateCollectionPointPresenceDataInput,
): Promise<AxiosResponse<UpdateTaskScheduleResponse>> =>
  axiosInstance.put<UpdateTaskScheduleResponse>(
    `/api/collection-point-presence/${id}`,
    data,
  );

export const deletePointPresence = (
  id: ScheduleModel["id"],
): Promise<AxiosResponse<DeleteTaskScheduleResponse>> =>
  axiosInstance.delete<DeleteTaskScheduleResponse>(
    `/api/collection-point-presence/${id}`,
  );
