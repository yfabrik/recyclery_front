import type { DonModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

export const getDonations = () => axiosInstance.get("/api/donations")
export const getDonationsStats = () => axiosInstance.get("/api/donations/stats")
export const createDonation = (data: DonModel) => axiosInstance.post(`/api/donations`, data)
export const updateDonation = (id: number, data: DonModel) => axiosInstance.put(`/api/donations/${id}`, data)