import type { CollectionPointModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

interface CollectionPointFilters {
    active_only?: string;
}
export const fetchCollectionPoints = (filters: CollectionPointFilters|null=null) =>
  axiosInstance.get("/api/collection-points", { params: filters });

export const createCollectionPoint = (data: CollectionPointModel) =>
  axiosInstance.post("/api/collection-points", data);

export const updateCollectionPoint = (id: number, data: CollectionPointModel) =>
  axiosInstance.put(`/api/collection-points/${id}`, data);

export const deleteCollectionPoint = (id: number) =>
  axiosInstance.delete(`/api/collection-points/${id}`);
