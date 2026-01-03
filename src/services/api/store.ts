import axiosInstance from "./axios";

interface StoreFilters {
    active?: 0 | 1
}

export const fetchStores = (filters: StoreFilters | null = null) => axiosInstance.get("/api/recycleries", { params: filters })
export const updateStore = (id: number, data) => axiosInstance.put(`/api/stores/${id}`, data)
export const createStore = (data) => axiosInstance.post("/api/stores", data)
export const deleteStore = (id: number) => axiosInstance.delete(`/api/stores/${id}`)

export const fetchCaisses = (storeId: number) => axiosInstance.get(`/api/stores/${storeId}/cash-registers`)
export const createCaisse = (storeId: number, data) => axiosInstance.post(`/api/stores/${storeId}/cash-registers`, data)
export const fetchCaisses2 = (storeId: number) => axiosInstance.get(`/api/cash-registers/store/${storeId}`) //TODO store en param

export const updateCaisse = (id: number, data) => axiosInstance.put(`/api/cash-registers/${id}`, data)
export const createCaisse2 = (data) => axiosInstance.post('/api/cash-registers', data)
export const getActiveCaisses = () => axiosInstance.get("/api/cash-sessions/active") //TODO params
export const deleteCaisse = (id: number) => axiosInstance.delete(`/api/cash-registers/${id}`)

export const OpenCaisse = (data) => axiosInstance.post('/api/cash-sessions/open', data)
export const closeCaisse = (id: number, data) => axiosInstance.put(`/api/cash-sessions/${id}/close`, data)