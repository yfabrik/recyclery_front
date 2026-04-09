import type { AxiosResponse } from "axios";
import type { LabeledItemModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/LabeledItemForm";


export interface itemsFilters {
    status?: string
    category_id?: number
    search?: string
    page?: number

}

interface ItemStats {
    total_items: number
    available_items: number
    sold_items: number
    reserved_items: number
    total_value: number
}

export const getLabeledItems = (filters?: itemsFilters): Promise<AxiosResponse<{ message: string, items: LabeledItemModel[], total: number }>> => axiosInstance.get("/api/labeled-items", { params: filters })
export const findItem = (id: string | number) => axiosInstance.get("/api/labeled-items/" + id)

export const updateLabeledItem = (id: number, data: Schema): Promise<AxiosResponse<{ success: true, message: string }>> => axiosInstance.put(`/api/labeled-items/${id}`, data)

export const createLabeledItem = (data: Schema): Promise<AxiosResponse<{ success: true, message: string, item: LabeledItemModel }>> => axiosInstance.post("/api/labeled-items", data)

export const deleteLabeledItem = (id: number) => axiosInstance.delete(`/api/labeled-items/${id}`)

export const sellItem = (id: number) => axiosInstance.post(`/api/labeled-items/${id}/sell`)

export const getItemFromBarcode = (barcode: string): Promise<AxiosResponse<{ success: boolean, item: LabeledItemModel }>> => axiosInstance.get(`/api/labeled-items/barcode/${barcode}`)

export const getItemStats = (filters?: itemsFilters): Promise<AxiosResponse<{ success: boolean, stats: ItemStats }>> => axiosInstance.get(`/api/labeled-items/stats`, { params: filters })