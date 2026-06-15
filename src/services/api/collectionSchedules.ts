 // @ts-nocheck
import axiosInstance from "./axios";
interface filters {
  active_only: string;
}
/**
 * @deprecated
 */
export const getCollectionSchedules = (filters?: filters) =>
  axiosInstance.get("/api/collection-schedules", { params: filters });
/**
 * @deprecated
 */
export const updateCollectionSchedule = (id: number, data) =>
  axiosInstance.put(`/api/collection-schedules/${id}`, data);
/**
 * @deprecated
 */
export const createCollectionSchedule = (data) =>
  axiosInstance.create("/api/collection-schedules", data);
/**
 * @deprecated
 */
export const deleteCollectionSchedule = (id: number) =>
  axiosInstance.delete(`/api/collection-schedules/${id}`);

/**
 * @deprecated
 */
export const getCollectionReceipt = (id: number) =>
  axiosInstance.get(`/api/collection-schedules/${id}/receipt`);

/**
 * @deprecated
 */
export const createCollectionReceipt = (id: number, data) =>
  axiosInstance.post(`/api/collection-schedules/${id}/receipt`, data);
