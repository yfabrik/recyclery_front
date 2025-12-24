import axiosInstance from "./axios";

export const getStats = () => axiosInstance.get("/api/dashboard/stats");
export const getActivities = () => axiosInstance.get("/api/dashboard/activities");
export const getChartsData = () => axiosInstance.get("/api/dashboard/charts");
export const getStoreStats = ()=>axiosInstance.get("/api/dashboard/stores-stats")

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
