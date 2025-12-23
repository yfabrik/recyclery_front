import axiosInstance from "./axios";

interface ArrivalFilters {
  date_from: string;
  date_to: string;
}

export const getArrivals = (filters:ArrivalFilters|null) =>
  axiosInstance.get("/api/arrivals", { params: filters });

export const createArrival = (data)=> axiosInstance.post("/api/arrivals",data)