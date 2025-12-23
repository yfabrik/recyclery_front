import axiosInstance from "./axios";

export const getLabeledItems = (filters)=>axiosInstance.get("/api/labeled-items",{params:filters})

export const updateLabeledItem = (id,data)=>axiosInstance.put(`/api/labeled-items/${id}`,data)
export const createLabeledItem = (data)=>axiosInstance.post("/api/labeled-items",data)
export const deleteLabeledItem = (id)=>axiosInstance.delete(`/api/labeled-items/${id}`)

export const sellItem = (id)=>axiosInstance.post(`/api/labeled-items/${id}/sell`)

export const getItemFromBarcode = (barcode)=>axiosInstance.get(`/api/labeled-items/barcode/${barcode}`)