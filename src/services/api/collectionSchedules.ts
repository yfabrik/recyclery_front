import axiosInstance from "./axios";
interface filters {
  active_only: string;
}
export const getCollectionSchedules = (filters?: filters) =>
  axiosInstance.get("/api/collection-schedules", { params: filters });

export const updateCollectionSchedule = (id: number, data) =>
  axiosInstance.put(`/api/collection-schedules/${id}`, data);
export const createCollectionSchedule = (data) =>
  axiosInstance.create("/api/collection-schedules", data);
export const deleteCollectionSchedule = (id: number) =>
  axiosInstance.delete(`/api/collection-schedules/${id}`);

export const getCollectionReceipt = (id: number) =>
  axiosInstance.get(`/api/collection-schedules/${id}/receipt`);

export const createCollectionReceipt = (id: number, data) =>
  axiosInstance.post(`/api/collection-schedules/${id}/receipt`, data);
