import type { CategoryModel } from "../../interfaces/Models";
import axiosInstance from "./axios";


interface filters {
  include?: string
  only_category?: boolean
  only_sub?: boolean
}
export const fetchCategoryIcons = () =>
  axiosInstance.get("/api/categories/icons");

export const fetchCategories = (filters?: filters) => axiosInstance.get("/api/categories", { params: filters });
export const getSubcategories = () => axiosInstance.get("/api/subcategories")
export const createCategory = (data: CategoryModel) =>
  axiosInstance.post("/api/categories", data);

export const updateCategory = (id: number, data: CategoryModel) =>
  axiosInstance.put(`/api/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  axiosInstance.delete(`/api/categories/${id}`);
