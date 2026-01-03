import type { LabeledItemModel } from "../../interfaces/Models";
import axiosInstance from "./axios";


interface itemsFilters{
    status?:string
    category_id?:number
    search?: string
    barcode?:string

}
export const getLabeledItems = (filters:itemsFilters|null=null)=>axiosInstance.get("/api/labeled-items",{params:filters})

export const updateLabeledItem = (id:number,data:LabeledItemModel)=>axiosInstance.put(`/api/labeled-items/${id}`,data)
export const createLabeledItem = (data:LabeledItemModel)=>axiosInstance.post("/api/labeled-items",data)
export const deleteLabeledItem = (id:number)=>axiosInstance.delete(`/api/labeled-items/${id}`)

export const sellItem = (id:number)=>axiosInstance.post(`/api/labeled-items/${id}/sell`)

export const getItemFromBarcode = (barcode:string)=>axiosInstance.get(`/api/labeled-items/barcode/${barcode}`)