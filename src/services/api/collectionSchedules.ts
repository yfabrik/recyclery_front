import axiosInstance from "./axios";
interface filters {
  filters: {
    active_only: string;
  };
}
export const getCollectionSchedules = ({ filters }: filters) =>
  axiosInstance.get("/api/collection-schedules", { params: filters });

export const updateCollectionSchedule = (id, data) =>
  axiosInstance.put(`/api/collection-schedules/${id}`, data);
export const createCollectionSchedule = (data) =>
  axiosInstance.create("/api/collection-schedules", data);
export const deleteCollectionSchedule = (id) =>
  axiosInstance.delete(`/api/collection-schedules/${id}`);


export const getCollectionReceipt =(id)=>axiosInstance.get(`/api/collection-schedules/${id}/receipt`)

export const createCollectionReceipt = (id,data)=>axiosInstance.post(`/api/collection-schedules/${id}/receipt`,data)