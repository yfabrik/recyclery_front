import type {
  CreateEcoOrganismResponse,
  DeleteEcoOrganismResponse,
  EcoOrganismStatsResponse,
  EcoOrgQuarterLabel,
  EcoOrgQuarterStatsDto,
  EcoOrgQuarterStatsResponse,
  ListEcoOrganismsResponse,
  UpdateEcoOrganismResponse
} from "@recyclerie/api/responses/ecoOrganism";
import type { EcoOrganismDataInput, EcoOrganismFilter, EcoOrganismFilterInput, EcoOrganismQuartersFilterInput } from "@recyclerie/api/schemas/ecoOrganism";
import type { AxiosResponse } from "axios";
import type { EcoOrgModel } from "../../interfaces/Models";
import axiosInstance from "./axios";

// export type { EcoOrganismFilter };
export type EcoOrganismQuarterStat = EcoOrgQuarterStatsDto;
// export type { EcoOrgQuarterLabel, EcoOrgQuarterStatsDto };

type EcoOrganismQuery = Omit<EcoOrganismFilterInput, "include"> & {
  include?: EcoOrganismFilter["include"];
};

export const formatEcoOrgQuarterLabel = (quarter: EcoOrgQuarterLabel | string): string => {
  const match = String(quarter).match(/^(\d{4})-T([1-4])$/);
  if (match) return `Q${match[2]} ${match[1]}`;
  return String(quarter);
};

export const parseEcoOrgQuarterKey = (value?: string) => {
  if (!value) return null;
  const apiMatch = value.match(/^(\d{4})-T([1-4])$/);
  if (apiMatch) {
    return { quarterNumber: Number(apiMatch[2]), year: Number(apiMatch[1]) };
  }
  const legacyMatch = value.match(/Q([1-4])\s*(\d{4})/i);
  if (legacyMatch) {
    return { quarterNumber: Number(legacyMatch[1]), year: Number(legacyMatch[2]) };
  }
  return null;
};

export const getEcoOrganisms = (
  filters?: EcoOrganismQuery,
): Promise<AxiosResponse<ListEcoOrganismsResponse>> =>
  axiosInstance.get<ListEcoOrganismsResponse>("/api/eco-organisms", {
    params: { ...filters, include: filters?.include?.toString() },
  });

export const fetchEcoOrganismsStats = (): Promise<
  AxiosResponse<EcoOrganismStatsResponse>
> => axiosInstance.get<EcoOrganismStatsResponse>("/api/eco-organisms/stats/summary");

export const fetchEcoOrganismQuarterStats = (filters?:EcoOrganismQuartersFilterInput): Promise<
  AxiosResponse<EcoOrgQuarterStatsResponse>
> =>
  axiosInstance.get<EcoOrgQuarterStatsResponse>(
    "/api/eco-organisms/stats/quarters",{params:{...filters}}
  );

export const createEcoOrganism = (
  data: EcoOrganismDataInput,
): Promise<AxiosResponse<CreateEcoOrganismResponse>> =>
  axiosInstance.post<CreateEcoOrganismResponse>("/api/eco-organisms", data);

export const updateEcoOrganism = (
  id: EcoOrgModel["id"],
  data: EcoOrganismDataInput,
): Promise<AxiosResponse<UpdateEcoOrganismResponse>> =>
  axiosInstance.put<UpdateEcoOrganismResponse>(`/api/eco-organisms/${id}`, data);

export const deleteEcoOrganism = (
  id: EcoOrgModel["id"],
): Promise<AxiosResponse<DeleteEcoOrganismResponse>> =>
  axiosInstance.delete<DeleteEcoOrganismResponse>(`/api/eco-organisms/${id}`);
