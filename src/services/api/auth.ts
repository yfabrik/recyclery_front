import type { AxiosResponse } from "axios";
import type {
  LoginBody,
  RegisterBody,
} from "@recyclerie/api/schemas/auth";
import type {
  LoginResponse,
  RegisterResponse,
  UserProfileResponse,
} from "@recyclerie/api/responses/auth";
import axiosInstance from "./axios";

export type { LoginBody, RegisterBody };

export const login = (
  data: LoginBody,
): Promise<AxiosResponse<LoginResponse>> =>
  axiosInstance.post<LoginResponse>("/api/auth/login", data, {
    withCredentials: true,
  });

export const register = (
  data: RegisterBody,
): Promise<AxiosResponse<RegisterResponse>> =>
  axiosInstance.post<RegisterResponse>("/api/auth/register", data);

export const getProfile = (): Promise<AxiosResponse<UserProfileResponse>> =>
  axiosInstance.get<UserProfileResponse>("/api/auth/profile");
