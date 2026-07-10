import type {
  CreateSkillResponse,
  ListSkillsResponse,
} from "@recyclerie/api/responses/skills";
import type { SkillDataInput } from "@recyclerie/api/schemas/skills";
import type { ApiMessageResponse } from "@recyclerie/api/types/response";
import type { AxiosResponse } from "axios";
import type { EmployeeModel, SkillModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

export const fetchSkills = (): Promise<AxiosResponse<ListSkillsResponse>> =>
  axiosInstance.get<ListSkillsResponse>("/api/skills");

export const createSkill = (
  data: SkillDataInput,
): Promise<AxiosResponse<CreateSkillResponse>> =>
  axiosInstance.post<CreateSkillResponse>("/api/skills", data);

export const updateSkill = (
  id: SkillModel["id"],
  data: SkillDataInput,
): Promise<AxiosResponse<CreateSkillResponse>> =>
  axiosInstance.put<CreateSkillResponse>(`/api/skills/${id}`, data);

export const deleteSkill = (
  id: SkillModel["id"],
): Promise<AxiosResponse<ApiMessageResponse>> =>
  axiosInstance.delete<ApiMessageResponse>(`/api/skills/${id}`);

export const updateEmployeeSkills = (
  id: EmployeeModel["id"],
  data: { skills: number[] },
): Promise<AxiosResponse<ApiMessageResponse>> =>
  axiosInstance.put<ApiMessageResponse>(`/api/employees/${id}/skills`, data);
