import type { EcoOrganismDataInput } from "@recyclerie/api/schemas/ecoOrganism";
import type { EcoOrgModel } from "../../interfaces/Models";
import type { EcoOrganismFormOutput, EcoOrganismFormValues } from "../schema/ecoOrganism";

export function ecoOrganismToFormValues(org: EcoOrgModel): Partial<EcoOrganismFormValues> {
  const raw = org as EcoOrgModel & {
    incategories?: Array<{ id: number }>;
    sellcategories?: Array<{ id: number }>;
    // inCategories?: Array<{ id: number }>;
    // sellCategories?: Array<{ id: number }>;
  };
  const inCats = raw.inCategories ?? raw.incategories ?? [];
  const sellCats = raw.sellCategories ?? raw.sellcategories ?? [];
  return {
    name: org.name,
    description: org.description ?? "",
    contact_email: org.contact_email ?? "",
    contact_phone: org.contact_phone ?? "",
    address: org.address ?? "",
    website: org.website ?? "",
    is_active: org.is_active,
    inCategories: inCats.map((cat) => (typeof cat === "number" ? cat : cat.id)),
    sellCategories: sellCats.map((cat) => (typeof cat === "number" ? cat : cat.id)),
  };
}

export const ecoOrganismPayloadFromForm = (data: EcoOrganismFormOutput): EcoOrganismDataInput => ({ ...data });
