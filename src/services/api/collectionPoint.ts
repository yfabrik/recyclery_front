import type { AxiosResponse } from "axios";
import type { CollectionPointModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/CollectionPointForm";

interface CollectionPointFilters {
  active_only?: string;
  include?: "presences"
}

interface axiosReturn {
  message: string,
  collection_points: CollectionPointModel[]
}

export const fetchCollectionPoints = (filters?: CollectionPointFilters): Promise<AxiosResponse<axiosReturn>> =>
  axiosInstance.get("/api/collection-points", { params: filters });

export const createCollectionPoint = (data: Schema) =>
  axiosInstance.post("/api/collection-points", data);

export const updateCollectionPoint = (id: number, data: Schema) =>
  axiosInstance.put(`/api/collection-points/${id}`, data);

export const deleteCollectionPoint = (id: number) =>
  axiosInstance.delete(`/api/collection-points/${id}`);
