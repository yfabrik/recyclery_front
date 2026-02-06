import type { AxiosResponse } from "axios";
import type { Schema } from "../../components/forms/PresencePointForm";
import axiosInstance from "./axios";
import type { ScheduleModel } from "../../interfaces/Models";

export const fetchCollectionPointPresence = (): Promise<AxiosResponse<{ message: string, schedules: ScheduleModel[] }>> => axiosInstance.get('/api/collection-point-presence')

export const fetchPresenceForPoint = (id: number) => axiosInstance.get(`/api/collection-point-presence/collection-point/${id}`)
export const createPointPresence = (data: Schema) => axiosInstance.post('/api/collection-point-presence', data)
export const updatePointPresence = (id: number, data: Schema) => axiosInstance.put(`/api/collection-point-presence/${id}`, data)
export const deletePointPresence = (id: number) => axiosInstance.delete(`/api/collection-point-presence/${id}`)
