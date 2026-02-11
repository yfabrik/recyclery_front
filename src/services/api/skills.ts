import type { AxiosResponse } from "axios";
import type { SkillModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

export const fetchSkills = (): Promise<
  AxiosResponse<{ skills: SkillModel[] } | SkillModel[]>
> => axiosInstance.get("/api/skills");

export const createSkill = (data: { name: string }) =>
  axiosInstance.post("/api/skills", data);

export const updateSkill = (id: number, data: { name: string }) =>
  axiosInstance.put(`/api/skills/${id}`, data);

export const deleteSkill = (id: number) =>
  axiosInstance.delete(`/api/skills/${id}`);
