import type { AxiosResponse } from "axios";
import type { ArrivalModel, EcoOrgModel } from "../../interfaces/Models";
import axiosInstance from "./axios";
import type { Schema } from "../../components/forms/EcoOrganismForm";

interface EcoOrgFilters {
  active?: boolean;
  include?: ("waste" | "inCategories" | "sellCategories")[];
}

type cat = {
  id: number;
  name: string;
  weight_kg: number,
}
type quarterStat = {
  total_weight_kg: number;
  categories: (cat & { subcategories: cat[] })[]
}
type quarterInBySourceType = Record<ArrivalModel["source_type"], quarterStat>;
/** Quarter stat for eco-organism: label (e.g. "Q4 2024") and value (e.g. weight_kg or count) */

export interface EcoOrganismQuarterStat extends Pick<
  EcoOrgModel,
  "id" | "name" | "description" | "is_active"
> {
  quarters: (quarterStat & {
    quarter: string;
    label: string;
    quarterIn: quarterStat & {
      // Backend currently returns an object; keep array support for backward compatibility.
      by_source_type: quarterInBySourceType | quarterInBySourceType[]
    }

    quarterSell: Omit<quarterStat, 'categories'> & {
      categories: (cat & { quantity: number, subcategories: (cat & { quantity: number })[] })[];
    },
    quarterOut: quarterStat
  })[];
}

/** Stats array: one item per eco-organism with its quarter data */
export type EcoOrganismQuarterStatsResponse = EcoOrganismQuarterStat[];

export const getEcoOrganisms = (
  filters?: EcoOrgFilters,
): Promise<AxiosResponse<{ message: string; eco_organisms: EcoOrgModel[] }>> =>
  axiosInstance.get("/api/eco-organisms", { params: { ...filters, include: filters?.include?.toString() } });

export const fetchEcoOrganismsStats = (): Promise<
  AxiosResponse<{
    stats: {
      total_eco_organisms: number;
      active_eco_organisms: number;
      inactive_eco_organisms: number;
    };
  }>
> => axiosInstance.get("/api/eco-organisms/stats/summary");

/** Fetches last 4 quarters stats per eco-organism (weight_kg per quarter). */
export const fetchEcoOrganismQuarterStats = (): Promise<
  AxiosResponse<{ stats: EcoOrganismQuarterStatsResponse }>
> => axiosInstance.get("/api/eco-organisms/stats/quarters");

export const createEcoOrganism = (
  data: Schema,
): Promise<AxiosResponse<{ message: string; eco_organism_id: number }>> =>
  axiosInstance.post("/api/eco-organisms", data);
export const updateEcoOrganism = (
  id: number,
  data: Schema,
): Promise<AxiosResponse<{ message: string; eco_organism: EcoOrgModel }>> =>
  axiosInstance.put(`/api/eco-organisms/${id}`, data);
export const deleteEcoOrganism = (id: number) =>
  axiosInstance.delete(`/api/eco-organisms/${id}`);
