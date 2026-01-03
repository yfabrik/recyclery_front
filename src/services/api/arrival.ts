import type { ArrivalModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

interface ArrivalFilters {
  date_from: string;
  date_to: string;
}

export const getArrivals = (filters: ArrivalFilters | null=null) =>
  axiosInstance.get("/api/arrivals", { params: filters });

export const createArrival = (data: ArrivalModel) => axiosInstance.post("/api/arrivals", data)