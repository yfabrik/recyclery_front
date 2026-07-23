import type {
  CreateCollectionPointResponse,
  DeleteCollectionPointResponse,
  ListCollectionPointsResponse,
  UpdateCollectionPointResponse,
} from "@recyclerie/api/responses/collectionPoints";
import type { CollectionPointDataInput, CollectionPointFilter, CollectionPointFilterInput } from "@recyclerie/api/schemas/collectionPoints";
import type { AxiosResponse } from "axios";
import type { CollectionPointModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
// import type { Schema } from "../../components/forms/CollectionPointForm";

// export type CollectionPointPayload = Omit<
//   Schema,
//   "contact_person" | "contact_phone" | "contact_email" | "notes" | "recyclery_id"
// > & {
//   contact_person: string | null;
//   contact_phone: string | null;
//   contact_email: string | null;
//   notes: string | null;
//   recyclery_id: number | null;
// };

// export type { CollectionPointFilter };

type CollectionPointQuery = Omit<CollectionPointFilterInput, "include"> & {
  include?: CollectionPointFilter["include"];
};

export const fetchCollectionPoints = (
  filters?: CollectionPointQuery,
): Promise<AxiosResponse<ListCollectionPointsResponse>> =>
  axiosInstance.get<ListCollectionPointsResponse>("/api/collection-points", {
    params: { ...filters, include: filters?.include?.toString() },
  });

export const createCollectionPoint = (
  data: CollectionPointDataInput,
): Promise<AxiosResponse<CreateCollectionPointResponse>> =>
  axiosInstance.post<CreateCollectionPointResponse>("/api/collection-points", data);

export const updateCollectionPoint = (
  id: CollectionPointModel["id"],
  data: CollectionPointDataInput,
): Promise<AxiosResponse<UpdateCollectionPointResponse>> =>
  axiosInstance.put<UpdateCollectionPointResponse>(
    `/api/collection-points/${id}`,
    data,
  );

export const deleteCollectionPoint = (
  id: CollectionPointModel["id"],
): Promise<AxiosResponse<DeleteCollectionPointResponse>> =>
  axiosInstance.delete<DeleteCollectionPointResponse>(
    `/api/collection-points/${id}`,
  );
