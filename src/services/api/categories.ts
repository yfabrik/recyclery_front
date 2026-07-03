import type { AxiosResponse } from "axios";
import type { CategoryListFilter, CategoryPatch } from "@recyclerie/api/schemas/categories";
import type {
  ListCategoriesResponse,
  CreateCategoryResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
  PatchCategoryResponse,
} from "@recyclerie/api/responses/categories";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/CategorieForm";

export type { CategoryListFilter, CategoryPatch };

export const fetchCategoryIcons = () =>
  axiosInstance.get("/api/categories/icons");

export const fetchCategories = (
  filters?: Partial<CategoryListFilter>,
): Promise<AxiosResponse<ListCategoriesResponse>> =>
  axiosInstance.get<ListCategoriesResponse>("/api/categories", {
    params: { ...filters, include: filters?.include?.toString() },
  });

export const createCategory = (
  data: Schema,
): Promise<AxiosResponse<CreateCategoryResponse>> =>
  axiosInstance.post<CreateCategoryResponse>("/api/categories", data);

export const updateCategory = (
  id: number,
  data: Schema,
): Promise<AxiosResponse<UpdateCategoryResponse>> =>
  axiosInstance.put<UpdateCategoryResponse>(`/api/categories/${id}`, data);

export const deleteCategory = (
  id: number,
): Promise<AxiosResponse<DeleteCategoryResponse>> =>
  axiosInstance.delete<DeleteCategoryResponse>(`/api/categories/${id}`);

export const patchCategory = (
  id: number,
  data: CategoryPatch,
): Promise<AxiosResponse<PatchCategoryResponse>> =>
  axiosInstance.patch<PatchCategoryResponse>(`/api/categories/${id}`, data);
