import type {
  CreateLabeledItemResponse,
  DeleteLabeledItemResponse,
  DetailLabeledItemResponse,
  LabeledItemStatsResponse,
  ListLabeledItemsResponse,
  TagLabeledItemSoldResponse,
  UpdateLabeledItemResponse,
} from "@recyclerie/api/responses/items";
import type { LabeledItemDataInput, LabeledItemFilter, LabeledItemFilterInput } from "@recyclerie/api/schemas/items";
import type { AxiosResponse } from "axios";
import type { LabeledItemModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type { LabeledItemFilter as LabeledItemFilters };

const CATEGORY_SUBCATEGORIES_INCLUDE = "category.subcategories" as const;

type LabeledItemQuery = Omit<LabeledItemFilterInput, "include"> & {
  include?: LabeledItemFilter["include"];
  page?: number;
};

const withCategoryInclude = (filters?: LabeledItemQuery) => ({
  ...filters,
  include: (filters?.include?.length
    ? filters.include
    : [CATEGORY_SUBCATEGORIES_INCLUDE]
  ).toString(),
});

export const getLabeledItems = (
  filters?: LabeledItemQuery,
): Promise<AxiosResponse<ListLabeledItemsResponse>> =>
  axiosInstance.get<ListLabeledItemsResponse>("/api/labeled-items", {
    params: withCategoryInclude(filters),
  });


  //TODO revoir
export const findItem = (
  id: string | number,
): Promise<AxiosResponse<DetailLabeledItemResponse>> =>
  axiosInstance.get<DetailLabeledItemResponse>(`/api/labeled-items/${id}`, {
    params: { include: CATEGORY_SUBCATEGORIES_INCLUDE },
  });

export const updateLabeledItem = (
  id: LabeledItemModel["id"],
  data: LabeledItemDataInput,
): Promise<AxiosResponse<UpdateLabeledItemResponse>> =>
  axiosInstance.put<UpdateLabeledItemResponse>(`/api/labeled-items/${id}`, data, {
    params: { include: CATEGORY_SUBCATEGORIES_INCLUDE },
  });

export const createLabeledItem = (
  data: LabeledItemDataInput,
): Promise<AxiosResponse<CreateLabeledItemResponse>> =>
  axiosInstance.post<CreateLabeledItemResponse>("/api/labeled-items", data, {
    params: { include: CATEGORY_SUBCATEGORIES_INCLUDE },
  });

export const deleteLabeledItem = (
  id: LabeledItemModel["id"],
): Promise<AxiosResponse<DeleteLabeledItemResponse>> =>
  axiosInstance.delete<DeleteLabeledItemResponse>(`/api/labeled-items/${id}`);

export const sellItem = (
  id: LabeledItemModel["id"],
): Promise<AxiosResponse<TagLabeledItemSoldResponse>> =>
  axiosInstance.post<TagLabeledItemSoldResponse>(`/api/labeled-items/${id}/sell`);

export const getItemFromBarcode = (
  barcode: LabeledItemModel["barcode"]|LabeledItemModel["id"],
): Promise<AxiosResponse<DetailLabeledItemResponse>> =>
  axiosInstance.get<DetailLabeledItemResponse>(
    `/api/labeled-items/barcode/${barcode}`,
    { params: { include: CATEGORY_SUBCATEGORIES_INCLUDE } },
  );

export const getItemStats = (
  filters?: LabeledItemQuery,
): Promise<AxiosResponse<LabeledItemStatsResponse>> =>
  axiosInstance.get<LabeledItemStatsResponse>("/api/labeled-items/stats", {
    params: withCategoryInclude(filters),
  });
