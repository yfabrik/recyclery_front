import type { AxiosResponse } from "axios";
import type { DonModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/DonForm";

interface donStats {
    total_donations: number;
    pending_donations: number;
    accepted_donations: number;
    rejected_donations: number;
    total_estimated_value: number;
  }

export const getDonations = (): Promise<AxiosResponse<{ message: string, donations: DonModel[] }>> => axiosInstance.get("/api/donations")
export const getDonationsStats = (): Promise<AxiosResponse<{ message: string, stats: donStats }>> => axiosInstance.get("/api/donations/stats")
export const createDonation = (data: Schema) => axiosInstance.post(`/api/donations`, data)
export const updateDonation = (id: number, data: Schema) => axiosInstance.put(`/api/donations/${id}`, data)
export const deleteDonation = (id: number) => axiosInstance.delete(`/api/donations/${id}`)