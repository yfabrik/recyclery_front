import type { ChipProps } from "@mui/material";
import type { AxiosResponse } from "axios";
import type { MuiIconName } from "../../components/SelectedIcon";
import type { StoreModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

export interface Activity {
  id: number
  type: string
  description: string
  amount: string
  time: string
  icon: MuiIconName
  color: NonNullable<ChipProps["color"]>
  status: string
  statusColor: NonNullable<ChipProps["color"]>
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

export interface StoreStat extends Pick<StoreModel, "id" | "name" | "address" | "phone" | "email"> {
  stats: {
    currentMonth: { transactions: number, revenue: number, averageTransaction: number, sessions: number }
    lastMonth: { transaction: number, revenue: number }
    items: { available: number, sold: number }
    growth: { revenue: number }
  }

}

export interface RemakeMe extends Pick<StoreModel, "id" | "name" | "address" | "phone" | "email"> {
  stats: {
    currentMonth: { transactions: number, revenue: number, averageTransaction: number, sessions: number, start: string, end: string }
    lastMonth: { transaction: number, revenue: number, start: string, end: string }
    items: { available: number, sold: number }
    growth: { revenue: number }
  }[]
}


export const getStats = (): Promise<AxiosResponse<{ data: Stats }>> => axiosInstance.get("/api/dashboard/stats");
export const getActivities = (): Promise<AxiosResponse<{ data: Activity[] }>> => axiosInstance.get("/api/dashboard/activities");
export const getChartsData = (): Promise<AxiosResponse<{ data: Charts }>> => axiosInstance.get("/api/dashboard/charts");
export const getStoreStats = (): Promise<AxiosResponse<{ stores: StoreStat[] }>> => axiosInstance.get("/api/dashboard/stores-stats")
export const getStoreHistoryStats = (id: StoreModel["id"]): Promise<AxiosResponse<{
  success: true, data: RemakeMe
}>> => axiosInstance.get("/api/dashboard/store-history/" + id)


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
