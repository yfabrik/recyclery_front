import type { AxiosResponse } from "axios";
import type { ArrivalModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { ArrivalFormSchema } from "../../components/forms/ArrivalForm";

interface ArrivalFilters {
  date_from: string;
  date_to: string;
}

export const getArrivals = (filters?: ArrivalFilters): Promise<AxiosResponse<{ message: string, arrivals: ArrivalModel[] }>> =>
  axiosInstance.get("/api/arrivals", { params: filters });

export const createArrival = (data: ArrivalFormSchema): Promise<AxiosResponse<{success: boolean, message: string, arrival: ArrivalModel }>> => axiosInstance.post("/api/arrivals", data)