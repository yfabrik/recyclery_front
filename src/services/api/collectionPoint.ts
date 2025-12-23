import axiosInstance from "./axios";
interface CollectionPointModel {
  id?: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  type: string;
  notes: string;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  recyclery_id?: number;
  //   Recyclery,: string;
}
interface CollectionPointFilters {
  active_only: string;
}
export const fetchCollectionPoints = (filters: CollectionPointFilters|null) =>
  axiosInstance.get("/api/collection-points", { params: filters });

export const createCollectionPoint = (data: CollectionPointModel) =>
  axiosInstance.post("/api/collection-points", data);

export const updateCollectionPoint = (id: number, data: CollectionPointModel) =>
  axiosInstance.put(`/api/collection-points/${id}`, data);

export const deleteCollectionPoint = (id: number) =>
  axiosInstance.delete(`/api/collection-points/${id}`);
