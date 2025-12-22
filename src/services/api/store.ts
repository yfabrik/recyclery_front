import axiosInstance from "./axios";

export const fetchStores = ()=>axiosInstance.get("/api/recycleries")
export const updateStore = (id,data)=>axiosInstance.put(`/api/stores/${id}`,data)
export const createStore = (data)=>axiosInstance.post("/api/stores",data)
export const deleteStore =(id)=>axiosInstance.delete(`/api/stores/${id}`)

export const fetchCaisses =(storeId:number)=> axiosInstance.get(`/api/stores/${storeId}/cash-registers`)
export const createCaisse = (storeId,data)=>axiosInstance.post(`/api/stores/${storeId}/cash-registers`,data)