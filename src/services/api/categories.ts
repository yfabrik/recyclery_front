import type {
  CreateCategoryResponse,
  DeleteCategoryResponse,
  ListCategoriesResponse,
  PatchCategoryResponse,
  UpdateCategoryResponse,
} from "@recyclerie/api/responses/categories";
import type { CategoryDataInput, CategoryListFilter, CategoryListFilterInput, CategoryPatchInput } from "@recyclerie/api/schemas/categories";
import type { AxiosResponse } from "axios";
import type { CategoryModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

type CategoryListQuery = Omit<CategoryListFilterInput, "include"> & {
  include?: CategoryListFilter["include"];
};

export const fetchCategoryIcons = () =>
  axiosInstance.get("/api/categories/icons");

export const fetchCategories = (
  filters?: CategoryListQuery,
): Promise<AxiosResponse<ListCategoriesResponse>> =>
  axiosInstance.get<ListCategoriesResponse>("/api/categories", {
    params: { ...filters, include: filters?.include?.toString() },
  });

export const createCategory = (
  data: CategoryDataInput,
): Promise<AxiosResponse<CreateCategoryResponse>> =>
  axiosInstance.post<CreateCategoryResponse>("/api/categories", data);

export const updateCategory = (
  id: CategoryModel["id"],
  data: CategoryDataInput,
): Promise<AxiosResponse<UpdateCategoryResponse>> =>
  axiosInstance.put<UpdateCategoryResponse>(`/api/categories/${id}`, data);

export const deleteCategory = (
  id: CategoryModel["id"],
): Promise<AxiosResponse<DeleteCategoryResponse>> =>
  axiosInstance.delete<DeleteCategoryResponse>(`/api/categories/${id}`);

export const patchCategory = (
  id: CategoryModel["id"],
  data: CategoryPatchInput,
): Promise<AxiosResponse<PatchCategoryResponse>> =>
  axiosInstance.patch<PatchCategoryResponse>(`/api/categories/${id}`, data);
