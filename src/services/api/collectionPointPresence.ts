import type { PointPresenceModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

export const fetchCollectionPointPresence = ()=>axiosInstance.get('/api/collection-point-presence')

export const fetchPresenceForPoint = (id:number)=> axiosInstance.get(`/api/collection-point-presence/collection-point/${id}`)
export const createPointPresence = (data:PointPresenceModel)=> axiosInstance.post('/api/collection-point-presence',data)
export const updatePointPresence = (id:number,data:PointPresenceModel)=>axiosInstance.put(`/api/collection-point-presence/${id}`,data)
export const deletePointPresence = (id:number)=>axiosInstance.delete(`/api/collection-point-presence/${id}`)
