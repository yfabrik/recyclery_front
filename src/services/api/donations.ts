import axiosInstance from "./axios";

export const getDonations = ()=>axiosInstance.get("/api/donations")
export const getDonationsStats = ()=>axiosInstance.get("/api/donations/stats")
export const createDonation = (data)=>axiosInstance.post(`/api/donations`,data)
export const updateDonation = (id,data)=>axiosInstance.put(`/api/donations/${id}`,data)