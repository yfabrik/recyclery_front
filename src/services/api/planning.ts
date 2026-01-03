import axiosInstance from "./axios";
interface filters {
  filters: {
    store_id: number;
  };
}
export const getPlanning = (filters: filters) =>
  axiosInstance.get("/api/planning", { params: filters });

export const updatePlanning = (id:number,data)=>axiosInstance.put(`/api/planning/${id}`,data)

export const createPlanning = (data)=>axiosInstance.post("/api/planning",data)

export const deletePlanning=(id:number)=>axiosInstance.delete(`/api/planning/${id}`)

export const getAvailableUserForTask = (id:number)=>axiosInstance.get(`/api/planning/${id}/available-employees`)