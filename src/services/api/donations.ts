import type {
  CreateDonationResponse,
  DeleteDonationResponse,
  DonationStatsResponse,
  ListDonationsResponse,
  UpdateDonationResponse,
} from "@recyclerie/api/responses/donations";
import type { DonationDataInput, DonationFilterInput } from "@recyclerie/api/schemas/donations";
import type { AxiosResponse } from "axios";
import type { DonModel } from "../../interfaces/Models";
import axiosInstance from "./axios";


export const getDonations = (
  filters?: DonationFilterInput,
): Promise<AxiosResponse<ListDonationsResponse>> =>
  axiosInstance.get<ListDonationsResponse>("/api/donations", { params: filters });

export const getDonationsStats = (): Promise<AxiosResponse<DonationStatsResponse>> =>
  axiosInstance.get<DonationStatsResponse>("/api/donations/stats");

export const createDonation = (
  data: DonationDataInput,
): Promise<AxiosResponse<CreateDonationResponse>> =>
  axiosInstance.post<CreateDonationResponse>("/api/donations", data);

export const updateDonation = (
  id: DonModel["id"],
  data: DonationDataInput,
): Promise<AxiosResponse<UpdateDonationResponse>> =>
  axiosInstance.put<UpdateDonationResponse>(`/api/donations/${id}`, data);

export const deleteDonation = (
  id: DonModel["id"],
): Promise<AxiosResponse<DeleteDonationResponse>> =>
  axiosInstance.delete<DeleteDonationResponse>(`/api/donations/${id}`);
