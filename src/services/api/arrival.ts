import type { AxiosResponse } from "axios";
import type { ArrivalModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { ArrivalFormSchema } from "../../components/forms/ArrivalForm";
import type { Pagination } from "./types";

interface ArrivalFilters {
  date_from?: string;
  date_to?: string;
  source_type?: ArrivalModel["source_type"];
  collection_point_id?: number;
  page?: number;
}

export const getArrivals = (filters?: ArrivalFilters): Promise<AxiosResponse<{ message: string, arrivals: ArrivalModel[], pagination: Pagination }>> =>
  axiosInstance.get("/api/arrivals", { params: filters });

export const createArrival = (data: ArrivalFormSchema): Promise<AxiosResponse<{success: boolean, message: string, arrival: ArrivalModel }>> => axiosInstance.post("/api/arrivals", data)