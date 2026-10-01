import type {
  CreateTaskScheduleResponse,
  DeleteTaskScheduleResponse,
  ListTaskSchedulesResponse,
  PlanningStatsResponse,
  UpdateTaskScheduleResponse
} from "@recyclerie/api/responses/taskSchedule";
import type { TaskScheduleDataInput, TaskScheduleFilterInput } from "@recyclerie/api/schemas/taskSchedule";
import type { AxiosResponse } from "axios";
import type { ScheduleModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type { TaskScheduleFilter };

// type PlanningFilters = Partial<TaskScheduleFilter> & {
//   category?: string;
// };

export const getPlanning = (
  filters?: TaskScheduleFilterInput,
): Promise<AxiosResponse<ListTaskSchedulesResponse>> =>
  axiosInstance.get<ListTaskSchedulesResponse>("/api/planning", {
    params: filters,
  });

export const updatePlanning = (
  id: ScheduleModel["id"],
  data: TaskScheduleDataInput,
): Promise<AxiosResponse<UpdateTaskScheduleResponse>> =>
  axiosInstance.put<UpdateTaskScheduleResponse>(`/api/planning/${id}`, data);

export const createPlanning = (
  data: TaskScheduleDataInput,
): Promise<AxiosResponse<CreateTaskScheduleResponse>> =>
  axiosInstance.post<CreateTaskScheduleResponse>("/api/planning", data);

export const deletePlanning = (
  id: ScheduleModel["id"],
): Promise<AxiosResponse<DeleteTaskScheduleResponse>> =>
  axiosInstance.delete<DeleteTaskScheduleResponse>(`/api/planning/${id}`);

export const getPlanningStats = (): Promise<
  AxiosResponse<PlanningStatsResponse>
> => axiosInstance.get<PlanningStatsResponse>("/api/planning/stats/overview");
