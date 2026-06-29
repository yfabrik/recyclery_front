import type { AxiosResponse } from "axios";
import type { UserModel } from "../../interfaces/Models";
import type { Schema as PasswordSchema } from "../../components/forms/PasswordChangeForm";
import type { Schema as ProfileSchema } from "../../components/forms/ProfileForm";
import axiosInstance from "./axios";

export const updateProfile = (
  data: ProfileSchema,
): Promise<AxiosResponse<{ message: string; user: UserModel }>> =>
  axiosInstance.put("/api/auth/profile", data);

export const updateProfilePassword = (
  data: PasswordSchema,
): Promise<AxiosResponse<{ message: string }>> =>
  axiosInstance.put("/api/auth/profile/password", data);
