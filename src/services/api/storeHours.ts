import axiosInstance from "./axios";

export const fetchStoreHours = () => axiosInstance.get("/api/store-hours");
export const updateStoreHours = (id, data) =>
  axiosInstance.put(`/api/store-hours/${id}`, data);
export const createStoreHours = (data) =>
  axiosInstance.post("/api/store-hours", data);
export const deleteStoreHours = (id) =>
  axiosInstance.put(`/api/store-hours/${id}`);
