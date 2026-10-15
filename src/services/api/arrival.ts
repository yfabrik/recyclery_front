import type {
  ArrivalCategoryStatsResponse,
  CreateArrivalResponse,
  DeleteArrivalResponse,
  ListArrivalsResponse,
} from "@recyclerie/api/responses/arrivals";
import type {
  arrivalDataInput,
  ArrivalCategoryStatsFilter,
  ArrivalFilter,
} from "@recyclerie/api/schemas/arrivals";
import type { AxiosResponse } from "axios";
import axiosInstance from "./axios";
import type { ArrivalModel } from "../../interfaces/Models";

export type { ArrivalFilter };

type WithDateInputs<T> = Omit<T, "date_from" | "date_to"> & {
  date_from?: Date | string;
  date_to?: Date | string;
};

export type ArrivalQuery = WithDateInputs<Partial<ArrivalFilter>> & {
  page?: number;
  perPage?: number;
};

export const getArrivals = (
  filters?: ArrivalQuery,
): Promise<AxiosResponse<ListArrivalsResponse>> =>
  axiosInstance.get<ListArrivalsResponse>("/api/arrivals", { params: filters });

export type ArrivalCategoryStatsQuery = WithDateInputs<
  Partial<ArrivalCategoryStatsFilter>
>;
//TODO filter devrait etre du type obtenu depuis @recyclerie
export const getArrivalCategoryStats = (
  filters?: ArrivalCategoryStatsQuery,
): Promise<AxiosResponse<ArrivalCategoryStatsResponse>> =>
  axiosInstance.get<ArrivalCategoryStatsResponse>(
    "/api/arrivals/stats/by-category",
    { params: filters },
  );

export const createArrival = (
  data: arrivalDataInput,
): Promise<AxiosResponse<CreateArrivalResponse>> =>
  axiosInstance.post<CreateArrivalResponse>("/api/arrivals", data);

export const deleteArrival = (
  id: ArrivalModel["id"],
): Promise<AxiosResponse<DeleteArrivalResponse>> =>
  axiosInstance.delete<DeleteArrivalResponse>(`/api/arrivals/${id}`);
