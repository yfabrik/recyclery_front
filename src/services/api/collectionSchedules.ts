import axiosInstance from "./axios";

export const getCollectionSchedules = ()=>axiosInstance.get("/api/collection-schedules")