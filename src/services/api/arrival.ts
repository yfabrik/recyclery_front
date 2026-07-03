import type { AxiosResponse } from "axios";
import type { ArrivalFilter } from "@recyclerie/api/schemas/arrivals";
import type {
  ListArrivalsResponse,
  CreateArrivalResponse,
} from "@recyclerie/api/responses/arrivals";
import axiosInstance from "./axios";
import type { ArrivalFormSchema } from "../../components/forms/ArrivalForm";

export type { ArrivalFilter };

export type ArrivalQuery = Omit<Partial<ArrivalFilter>, "date_from" | "date_to"> & {
  page?: number;
  date_from?: Date | string;
  date_to?: Date | string;
};

export const getArrivals = (
  filters?: ArrivalQuery,
): Promise<AxiosResponse<ListArrivalsResponse>> =>
  axiosInstance.get<ListArrivalsResponse>("/api/arrivals", { params: filters });

export const createArrival = (
  data: ArrivalFormSchema,
): Promise<AxiosResponse<CreateArrivalResponse>> =>
  axiosInstance.post<CreateArrivalResponse>("/api/arrivals", data);
