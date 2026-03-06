import type { AxiosResponse } from "axios";
import type { CategoryModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/CategorieForm";

type include = "category" | "parent" | "promo"
interface filters {
  include?: include | include[];
  only_category?: boolean;
  only_sub?: boolean;
  in?: boolean;
  out?: boolean;
  sell?: boolean;
}

interface axiosReturn {
  message: string;
  categories: CategoryModel[];
}
export const fetchCategoryIcons = () =>
  axiosInstance.get("/api/categories/icons");

export const fetchCategories = (
  filters?: filters,
): Promise<AxiosResponse<axiosReturn>> => {
  return axiosInstance.get("/api/categories", {
    params: { ...filters, include: filters?.include?.toString() },
  });
}

/**
 * @deprecated use fetch categorie with filters
 */
export const getSubcategories = () => axiosInstance.get("/api/subcategories");

export const createCategory = (
  data: Schema,
): Promise<
  AxiosResponse<{
    message: string;
    category: CategoryModel;
  }>
> => axiosInstance.post("/api/categories", data);

export const updateCategory = (
  id: number,
  data: Schema,
): Promise<
  AxiosResponse<{
    message: string;
    category: CategoryModel;
  }>
> => axiosInstance.put(`/api/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  axiosInstance.delete(`/api/categories/${id}`);

export const patchCategory = (
  id: number,
  data: { in?: boolean; out?: boolean; sell?: boolean },
) => axiosInstance.patch(`/api/categories/${id}`, data);
