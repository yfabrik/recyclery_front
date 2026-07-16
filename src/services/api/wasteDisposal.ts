import type {
  CreateWasteResponse,
  DeleteWasteResponse,
  ListWasteResponse,
  UpdateWasteResponse,
  WasteStatsResponse,
} from "@recyclerie/api/responses/waste";
import type { ListWasteQueryInput, WasteBodyInput } from "@recyclerie/api/schemas/waste";
import type { AxiosResponse } from "axios";
import type { WasteModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type { WasteBody as WastePayload, ListWasteQuery as WasteFilter };

export const getWastes = (
  filters?: ListWasteQueryInput,
): Promise<AxiosResponse<ListWasteResponse>> =>
  axiosInstance.get<ListWasteResponse>("/api/waste-disposals", { params: {
    filters
  } });

export const getWasteStats = (): Promise<AxiosResponse<WasteStatsResponse>> =>
  axiosInstance.get<WasteStatsResponse>("/api/waste-disposals/stats/summary");

export const updateWaste = (
  id: WasteModel["id"],
  data: WasteBodyInput,
): Promise<AxiosResponse<UpdateWasteResponse>> =>
  axiosInstance.put<UpdateWasteResponse>(`/api/waste-disposals/${id}`, data);

export const createWaste = (
  data: WasteBodyInput,
): Promise<AxiosResponse<CreateWasteResponse>> =>
  axiosInstance.post<CreateWasteResponse>("/api/waste-disposals", data);

export const deleteWaste = (
  id: WasteModel["id"],
): Promise<AxiosResponse<DeleteWasteResponse>> =>
  axiosInstance.delete<DeleteWasteResponse>(`/api/waste-disposals/${id}`);
