import axiosInstance from "./axios";
interface CategoryModel {
  id?: number;
  name: string;
  description:string
  parend_id?: string | null;
  icon?:string |null
}
export const fetchCategoryIcons = () =>
  axiosInstance.get("/api/categories/icons");

export const fetchCategories = () => axiosInstance.get("/api/categories");

export const createCategory = (data: CategoryModel) =>
  axiosInstance.post("/api/categories", data);

export const updateCategory = (id: number, data: CategoryModel) =>
  axiosInstance.put(`/api/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  axiosInstance.delete(`/api/categories/${id}`);
