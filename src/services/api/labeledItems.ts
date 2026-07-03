import type { AxiosResponse } from "axios";
import type { LabeledItemFilter } from "@recyclerie/api/schemas/items";
import type {
  ListLabeledItemsResponse,
  DetailLabeledItemResponse,
  CreateLabeledItemResponse,
  UpdateLabeledItemResponse,
  DeleteLabeledItemResponse,
  TagLabeledItemSoldResponse,
  LabeledItemStatsResponse,
} from "@recyclerie/api/responses/items";
import axiosInstance from "./axios";
import type { LabeledItemPayload } from "../../components/forms/itemCoreSchema";

export type { LabeledItemFilter as LabeledItemFilters };

const CATEGORY_SUBCATEGORIES_INCLUDE = "category.subcategories";

const withCategoryInclude = <T extends LabeledItemFilter | undefined>(filters?: T) => ({
  ...filters,
  include: (filters?.include?.length
    ? filters.include
    : [CATEGORY_SUBCATEGORIES_INCLUDE]
  ).join(","),
});

export const getLabeledItems = (
  filters?: LabeledItemFilter & { page?: number },
): Promise<AxiosResponse<ListLabeledItemsResponse>> =>
  axiosInstance.get<ListLabeledItemsResponse>("/api/labeled-items", {
    params: withCategoryInclude(filters),
  });

export const findItem = (
  id: string | number,
): Promise<AxiosResponse<DetailLabeledItemResponse>> =>
  axiosInstance.get<DetailLabeledItemResponse>(`/api/labeled-items/${id}`, {
    params: { include: CATEGORY_SUBCATEGORIES_INCLUDE },
  });

export const updateLabeledItem = (
  id: number,
  data: LabeledItemPayload,
): Promise<AxiosResponse<UpdateLabeledItemResponse>> =>
  axiosInstance.put<UpdateLabeledItemResponse>(`/api/labeled-items/${id}`, data, {
    params: { include: CATEGORY_SUBCATEGORIES_INCLUDE },
  });

export const createLabeledItem = (
  data: LabeledItemPayload,
): Promise<AxiosResponse<CreateLabeledItemResponse>> =>
  axiosInstance.post<CreateLabeledItemResponse>("/api/labeled-items", data, {
    params: { include: CATEGORY_SUBCATEGORIES_INCLUDE },
  });

export const deleteLabeledItem = (
  id: number,
): Promise<AxiosResponse<DeleteLabeledItemResponse>> =>
  axiosInstance.delete<DeleteLabeledItemResponse>(`/api/labeled-items/${id}`);

export const sellItem = (
  id: number,
): Promise<AxiosResponse<TagLabeledItemSoldResponse>> =>
  axiosInstance.post<TagLabeledItemSoldResponse>(`/api/labeled-items/${id}/sell`);

export const getItemFromBarcode = (
  barcode: string,
): Promise<AxiosResponse<DetailLabeledItemResponse>> =>
  axiosInstance.get<DetailLabeledItemResponse>(
    `/api/labeled-items/barcode/${barcode}`,
    { params: { include: CATEGORY_SUBCATEGORIES_INCLUDE } },
  );

export const getItemStats = (
  filters?: LabeledItemFilter & { page?: number },
): Promise<AxiosResponse<LabeledItemStatsResponse>> =>
  axiosInstance.get<LabeledItemStatsResponse>("/api/labeled-items/stats", {
    params: withCategoryInclude(filters),
  });
