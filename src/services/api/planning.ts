import type { AxiosResponse } from "axios";
import type { TaskScheduleFilter } from "@recyclerie/api/schemas/taskSchedule";
import type {
  ListTaskSchedulesResponse,
  DetailTaskScheduleResponse,
  CreateTaskScheduleResponse,
  UpdateTaskScheduleResponse,
  DeleteTaskScheduleResponse,
  AvailableEmployeesResponse,
  PlanningStatsResponse,
} from "@recyclerie/api/responses/taskSchedule";
import axiosInstance from "./axios";
import type { TaskScheduleData } from "@recyclerie/api/schemas/taskSchedule";

export type { TaskScheduleFilter };

type PlanningFilters = Partial<TaskScheduleFilter> & {
  category?: string;
};

export const getPlanning = (
  filters?: PlanningFilters,
): Promise<AxiosResponse<ListTaskSchedulesResponse>> =>
  axiosInstance.get<ListTaskSchedulesResponse>("/api/planning", {
    params: filters,
  });

export const updatePlanning = (
  id: number,
  data: Partial<TaskScheduleData>,
): Promise<AxiosResponse<UpdateTaskScheduleResponse>> =>
  axiosInstance.put<UpdateTaskScheduleResponse>(`/api/planning/${id}`, data);

export const createPlanning = (
  data: Partial<TaskScheduleData>,
): Promise<AxiosResponse<CreateTaskScheduleResponse>> =>
  axiosInstance.post<CreateTaskScheduleResponse>("/api/planning", data);

export const deletePlanning = (
  id: number,
): Promise<AxiosResponse<DeleteTaskScheduleResponse>> =>
  axiosInstance.delete<DeleteTaskScheduleResponse>(`/api/planning/${id}`);

export const getAvailableUserForTask = (
  id: number,
): Promise<AxiosResponse<AvailableEmployeesResponse>> =>
  axiosInstance.get<AvailableEmployeesResponse>(
    `/api/planning/${id}/available-employees`,
  );

export const getPlanningStats = (): Promise<
  AxiosResponse<PlanningStatsResponse>
> => axiosInstance.get<PlanningStatsResponse>("/api/planning/stats/overview");
