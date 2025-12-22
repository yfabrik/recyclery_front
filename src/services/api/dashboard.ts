import axiosInstance from "./axios";

export const getStats = () => axiosInstance.get("/stats");
export const getActivities = () => axiosInstance.get("/activities");
export const getChartsData = () => axiosInstance.get("/charts");

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
