import type {
  CreateArrivalResponse,
  DeleteArrivalResponse,
  ListArrivalsResponse,
} from "@recyclerie/api/responses/arrivals";
import type {
  arrivalDataInput,
  ArrivalFilter,
} from "@recyclerie/api/schemas/arrivals";
import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { ArrivalModel } from "../../interfaces/Models";

export type { ArrivalFilter };

export type ArrivalQuery = Omit<
  Partial<ArrivalFilter>,
  "date_from" | "date_to"
> & {
  page?: number;
  date_from?: Date | string;
  date_to?: Date | string;
};

export const getArrivals = (
  filters?: ArrivalQuery,
): Promise<AxiosResponse<ListArrivalsResponse>> =>
  axiosInstance.get<ListArrivalsResponse>("/api/arrivals", { params: filters });

export const createArrival = (
  data: arrivalDataInput,
): Promise<AxiosResponse<CreateArrivalResponse>> =>
  axiosInstance.post<CreateArrivalResponse>("/api/arrivals", data);

export const deleteArrival = (
  id: ArrivalModel["id"],
): Promise<AxiosResponse<DeleteArrivalResponse>> =>
  axiosInstance.delete<DeleteArrivalResponse>(`/api/arrivals/${id}`);
