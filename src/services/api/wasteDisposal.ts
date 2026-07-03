import type { AxiosResponse } from "axios";
import type { WasteBody, ListWasteQuery } from "@recyclerie/api/schemas/waste";
import type {
  ListWasteResponse,
  CreateWasteResponse,
  UpdateWasteResponse,
  DeleteWasteResponse,
  WasteStatsResponse,
} from "@recyclerie/api/responses/waste";
import axiosInstance from "./axios";

export type { WasteBody as WastePayload, ListWasteQuery as WasteFilter };

export const getWastes = (
  filters?: ListWasteQuery,
): Promise<AxiosResponse<ListWasteResponse>> =>
  axiosInstance.get<ListWasteResponse>("/api/waste-disposals", { params: filters });

export const getWasteStats = (): Promise<AxiosResponse<WasteStatsResponse>> =>
  axiosInstance.get<WasteStatsResponse>("/api/waste-disposals/stats/summary");

export const updateWaste = (
  id: number,
  data: WasteBody,
): Promise<AxiosResponse<UpdateWasteResponse>> =>
  axiosInstance.put<UpdateWasteResponse>(`/api/waste-disposals/${id}`, data);

export const createWaste = (
  data: WasteBody,
): Promise<AxiosResponse<CreateWasteResponse>> =>
  axiosInstance.post<CreateWasteResponse>("/api/waste-disposals", data);

export const deleteWaste = (
  id: number,
): Promise<AxiosResponse<DeleteWasteResponse>> =>
  axiosInstance.delete<DeleteWasteResponse>(`/api/waste-disposals/${id}`);
