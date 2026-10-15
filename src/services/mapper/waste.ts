import type {
  ListWasteQueryInput,
  WasteBodyInput,
} from "@recyclerie/api/schemas/waste";
import type { WasteModel } from "../../interfaces/Models";
import type {
  WasteFilterFormValues,
  WasteFormOutput,
  WasteFormValues,
} from "../schema/waste";
import { emptyToNull, omitBlank } from "../zodTransform";

export const toWasteQuery = (f: WasteFilterFormValues): ListWasteQueryInput => ({
  date_from: f.date_from,
  date_to: f.date_to,
  ...omitBlank({
    category_id: f.category_id,
    disposal_type: f.disposal_type,
  }),
});

export function wasteToFormValues(
  disposal: WasteModel,
): Partial<WasteFormValues> {
  return {
    disposal_date: new Date(disposal.disposal_date),
    disposal_type: disposal.disposal_type,
    category_id: disposal.category_id,
    subcategory_id: disposal.subcategory_id ?? "",
    eco_organism_id: disposal.eco_organism_id ?? "",
    weight_kg: Number(disposal.weight_kg),
    volume_m3: Number(disposal.volume_m3 ?? 0),
    transport_method: disposal.transport_method ?? "",
    transport_company: disposal.transport_company ?? "",
    transport_cost: Number(disposal.transport_cost ?? 0),
    notes: disposal.notes ?? "",
  };
}

export const wastePayloadFromForm = (
  data: WasteFormOutput,
): WasteBodyInput => {
  return {
    disposal_date: data.disposal_date,
    disposal_type: data.disposal_type,
    category_id: data.category_id,
    subcategory_id:
      data.subcategory_id === "" ? null : data.subcategory_id,
    eco_organism_id:
      data.eco_organism_id === "" ? null : data.eco_organism_id,
    weight_kg: data.weight_kg,
    volume_m3: data.volume_m3,
    transport_method: emptyToNull(data.transport_method),
    transport_company: emptyToNull(data.transport_company),
    transport_cost: data.transport_cost,
    notes: emptyToNull(data.notes),
  } satisfies WasteBodyInput;
};
