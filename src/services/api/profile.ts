import type { AxiosResponse } from "axios";
import type { UpdateProfileInput, UpdatePasswordBody } from "@recyclerie/api/schemas/auth";
import type {
  UpdateProfileResponse,
  UpdatePasswordResponse,
} from "@recyclerie/api/responses/auth";
import axiosInstance from "./axios";

export const updateProfile = (
  data: UpdateProfileInput,
): Promise<AxiosResponse<UpdateProfileResponse>> =>
  axiosInstance.put<UpdateProfileResponse>("/api/auth/profile", data);

export const updateProfilePassword = (
  data: UpdatePasswordBody,
): Promise<AxiosResponse<UpdatePasswordResponse>> =>
  axiosInstance.put<UpdatePasswordResponse>("/api/auth/profile/password", data);
