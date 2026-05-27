import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { StoreModel } from "../../interfaces/Models";
import type { ReactNode } from "react";

export interface Activity {
  id: number
  type: string
  description: string
  amount: string
  time: string
  icon: string | ReactNode
  color: string
  status: string
  statusColor: string
}

export interface Stats {

  totalItems: number,
  availableItems: number,
  soldThisMonth: number,
  totalRevenue: number,
  pendingDonations: number,
  scheduledCollections: number,
  categoriesCount: number,
  usersCount: number,
  lastMonthRevenue: number,
  lastMonthSales: number,
  thisMonthRevenue: number,
  thisMonthSales: number
}

interface Charts {
  sales: number[]
  revenue: number[]
  labels: string[]
}

interface StoreStat extends Pick<StoreModel, "id" | "name" | "address" | "phone" | "email"> {
  stats: {
    currentMonth: { transaction: number, revenue: number, averageTransaction: number, sessions: number }
    lastMonth: { transaction: number, revenue: number }
    items: { available: number }
    growth: { revenue: number }
  }

}

export const getStats = (): Promise<AxiosResponse<{ data: Stats }>> => axiosInstance.get("/api/dashboard/stats");
export const getActivities = (): Promise<AxiosResponse<{ data: Activity[] }>> => axiosInstance.get("/api/dashboard/activities");
export const getChartsData = (): Promise<AxiosResponse<{ data: Charts }>> => axiosInstance.get("/api/dashboard/charts");
export const getStoreStats = (): Promise<AxiosResponse<{ stores: StoreStat[] }>> => axiosInstance.get("/api/dashboard/stores-stats")

export const getAllDashboardData = async () => {
  const [statsResponse, activitiesResponse, chartsResponse] = await Promise.all(
    [getStats(), getActivities(), getChartsData()]
  );
  return {
    success: true,
    data: {
      stats: statsResponse.data.data,
      activities: activitiesResponse.data.data,
      charts: chartsResponse.data.data,
    },
  };
};
