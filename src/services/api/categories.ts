import type { AxiosResponse } from "axios";
import type { CategoryModel } from "../../interfaces/Models";
import axiosInstance from "./axios";


interface filters {
  include?: "category"
  only_category?: boolean
  only_sub?: boolean
}

interface axiosReturn {
  message: string, categories: CategoryModel[]
}
export const fetchCategoryIcons = () =>
  axiosInstance.get("/api/categories/icons");

export const fetchCategories = (filters?: filters): Promise<AxiosResponse<axiosReturn>> => axiosInstance.get("/api/categories", {
  params: filters
});
/**
 * @deprecated use fetch categorie with filters
 */
export const getSubcategories = () => axiosInstance.get("/api/subcategories")

export const createCategory = (data: CategoryModel) =>
  axiosInstance.post("/api/categories", data);

export const updateCategory = (id: number, data: CategoryModel) =>
  axiosInstance.put(`/api/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  axiosInstance.delete(`/api/categories/${id}`);
