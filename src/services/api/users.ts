import type {
  CreateUserResponse,
  DeleteUserResponse,
  ListUsersResponse,
  UpdateUserPasswordResponse,
  UpdateUserResponse,
  UserStatsResponse,
} from "@recyclerie/api/responses/users";
import type { UserAdminUpdatePasswordInput, UserCreateInput, UserListFilter, UserListFilterInput, UserUpdateInput } from "@recyclerie/api/schemas/users";
import type { AxiosResponse } from "axios";
import type { UserModel } from "../../interfaces/Models";
import axiosInstance from "./axios";


type UserListQuery = Omit<UserListFilterInput, "include"> & {
  include?: UserListFilter["include"];
};

export const fetchUsers = (
  filters?: UserListQuery,
): Promise<AxiosResponse<ListUsersResponse>> =>
  axiosInstance.get<ListUsersResponse>("/api/users", {
    params: { ...filters, include: filters?.include?.toString() },
  });

export const createUser = (
  data: UserCreateInput,
): Promise<AxiosResponse<CreateUserResponse>> =>
  axiosInstance.post<CreateUserResponse>("/api/users", data);

export const updateUser = (
  id: UserModel["id"],
  data: UserUpdateInput,
): Promise<AxiosResponse<UpdateUserResponse>> =>
  axiosInstance.put<UpdateUserResponse>(`/api/users/${id}`, data);

export const deleteUser = (
  id: UserModel["id"],
): Promise<AxiosResponse<DeleteUserResponse>> =>
  axiosInstance.delete<DeleteUserResponse>(`/api/users/${id}`);

export const updateUserPassword = (
  id: UserModel["id"],
  data: UserAdminUpdatePasswordInput,
): Promise<AxiosResponse<UpdateUserPasswordResponse>> =>
  axiosInstance.patch<UpdateUserPasswordResponse>(
    `/api/users/${id}/password`,
    data,
  );

export const getRoles = () => axiosInstance.get("/api/users/roles");

export const getUsersStats = (): Promise<AxiosResponse<UserStatsResponse>> =>
  axiosInstance.get<UserStatsResponse>("/api/users/stats");
