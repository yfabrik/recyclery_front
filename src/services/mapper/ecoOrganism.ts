import type {
  EcoOrganismDataInput,
  EcoOrganismQuartersFilterInput,
} from "@recyclerie/api/schemas/ecoOrganism";
import type { EcoOrgModel } from "../../interfaces/Models";
import type {
  EcoOrgFilterFormValues,
  EcoOrganismFormOutput,
  EcoOrganismFormValues,
} from "../schema/ecoOrganism";
import { emptyToNull, omitBlank } from "../zodTransform";

/** Only the collection point is server-side; every other stats filter is applied in memory. */
export const toEcoOrgQuartersQuery = (
  f: EcoOrgFilterFormValues,
): EcoOrganismQuartersFilterInput =>
  omitBlank({ point: f.collection_point_id });

export function ecoOrganismToFormValues(
  org: EcoOrgModel,
): Partial<EcoOrganismFormValues> {
  const raw = org as EcoOrgModel & {
    incategories?: Array<{ id: number }>;
    sellcategories?: Array<{ id: number }>;
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
    sellCategories: sellCats.map((cat) =>
      typeof cat === "number" ? cat : cat.id,
    ),
  };
}

export const ecoOrganismPayloadFromForm = (
  data: EcoOrganismFormOutput,
): EcoOrganismDataInput =>
  ({
    name: data.name,
    description: emptyToNull(data.description),
    contact_email: emptyToNull(data.contact_email),
    contact_phone: emptyToNull(data.contact_phone),
    address: emptyToNull(data.address),
    website: emptyToNull(data.website),
    inCategories: data.inCategories,
    sellCategories: data.sellCategories,
    is_active: data.is_active,
  }) satisfies EcoOrganismDataInput;
