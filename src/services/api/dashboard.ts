import type { AxiosResponse } from "axios";
import type {
  DashboardStatsDto,
  DashboardActivityDto,
  DashboardChartsDto,
  DashboardStoreDto,
  DashboardStoreHistoryDto,
  DashboardStatsResponse,
  DashboardActivitiesResponse,
  DashboardChartsResponse,
  DashboardStoreStatsResponse,
  DashboardStoreHistoryResponse,
} from "@recyclerie/api/responses/dashboard";
import axiosInstance from "./axios";

export type Stats = DashboardStatsDto;
export type Activity = DashboardActivityDto;
export type Charts = DashboardChartsDto;
export type StoreStat = DashboardStoreDto;
export type StoreHistory = DashboardStoreHistoryDto;

export const getStats = (): Promise<AxiosResponse<DashboardStatsResponse>> =>
  axiosInstance.get<DashboardStatsResponse>("/api/dashboard/stats");

export const getActivities = (): Promise<
  AxiosResponse<DashboardActivitiesResponse>
> => axiosInstance.get<DashboardActivitiesResponse>("/api/dashboard/activities");

export const getChartsData = (): Promise<
  AxiosResponse<DashboardChartsResponse>
> => axiosInstance.get<DashboardChartsResponse>("/api/dashboard/charts");

export const getStoreStats = (): Promise<
  AxiosResponse<DashboardStoreStatsResponse>
> =>
  axiosInstance.get<DashboardStoreStatsResponse>("/api/dashboard/stores-stats");

export const getStoreHistoryStats = (
  id: number,
): Promise<AxiosResponse<DashboardStoreHistoryResponse>> =>
  axiosInstance.get<DashboardStoreHistoryResponse>(
    `/api/dashboard/store-history/${id}`,
  );

export const getAllDashboardData = async () => {
  const [statsResponse, activitiesResponse, chartsResponse] = await Promise.all(
    [getStats(), getActivities(), getChartsData()],
  );
  return {
    success: true as const,
    data: {
      stats: statsResponse.data.data,
      activities: activitiesResponse.data.data,
      charts: chartsResponse.data.data,
    },
  };
};
