import axiosInstance from "./axios";

export const getWastes = (filters) =>
  axiosInstance.get(`/api/waste-disposals`, { params: filters });
export const getWasteStats = () =>
  axiosInstance.get("/api/waste-disposals/stats/summary");
export const updateWaste = (id, data) =>
  axiosInstance.put(`/api/waste-disposals/${id}`, data);
export const createWaste = (data) =>
  axiosInstance.post("/api/waste-disposals", data);
export const deleteWaste=(id)=>axiosInstance.put(`/api/waste-disposals/${id}`)