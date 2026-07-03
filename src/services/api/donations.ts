import type { AxiosResponse } from "axios";
import type { DonationData, DonationFilter } from "@recyclerie/api/schemas/donations";
import type {
  ListDonationsResponse,
  CreateDonationResponse,
  UpdateDonationResponse,
  DeleteDonationResponse,
  DonationStatsResponse,
} from "@recyclerie/api/responses/donations";
import axiosInstance from "./axios";

export type { DonationData as DonationPayload, DonationFilter };

export const getDonations = (
  filters?: DonationFilter,
): Promise<AxiosResponse<ListDonationsResponse>> =>
  axiosInstance.get<ListDonationsResponse>("/api/donations", { params: filters });

export const getDonationsStats = (): Promise<AxiosResponse<DonationStatsResponse>> =>
  axiosInstance.get<DonationStatsResponse>("/api/donations/stats");

export const createDonation = (
  data: DonationData,
): Promise<AxiosResponse<CreateDonationResponse>> =>
  axiosInstance.post<CreateDonationResponse>("/api/donations", data);

export const updateDonation = (
  id: number,
  data: DonationData,
): Promise<AxiosResponse<UpdateDonationResponse>> =>
  axiosInstance.put<UpdateDonationResponse>(`/api/donations/${id}`, data);

export const deleteDonation = (
  id: number,
): Promise<AxiosResponse<DeleteDonationResponse>> =>
  axiosInstance.delete<DeleteDonationResponse>(`/api/donations/${id}`);
