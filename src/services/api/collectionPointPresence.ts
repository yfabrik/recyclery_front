import axiosInstance from "./axios";

export const fetchCollectionPointPresence = ()=>axiosInstance.get('/api/collection-point-presence')

export const fetchPresenceForPoint = (id)=> axiosInstance.get(`/api/collection-point-presence/collection-point/${id}`)
export const createPointPresence = (data)=> axiosInstance.post('/api/collection-point-presence',data)
export const updatePointPresence = (id,data)=>axiosInstance.put(`/api/collection-point-presence/${id}`,data)
export const deletePointPresence = (id)=>axiosInstance.delete(`/api/collection-point-presence/${id}`)
