import type { arrivalDataInput } from "@recyclerie/api/schemas/arrivals";
import type { ArrivalQuery } from "../api/arrival";
import { toIsoTime } from "../dateService";
import type {
  ArrivalFilterFormValues,
  ArrivalFormOutput,
} from "../schema/arrival";
import { emptyToNull, omitBlank } from "../zodTransform";

export const toArrivalQuery = (f: ArrivalFilterFormValues): ArrivalQuery => ({
  date_from: f.date_from,
  date_to: f.date_to,
  ...omitBlank({
    category_id: f.category_id,
    source_type: f.source_type,
    collection_point_id: f.collection_point_id,
  }),
});

export const arrivalPayloadFromForm = (
  data: ArrivalFormOutput,
): arrivalDataInput => {
  return {
    category_id: data.category_id,
    subcategory_id:
      data.subcategory_id === "" ? null : data.subcategory_id,
    weight: data.weight,
    arrival_date: data.arrival_date,
    arrival_time: toIsoTime(data.arrival_time),
    source_type: data.source_type,
    collection_point_id:
      data.source_type !== "point" || data.collection_point_id === ""
        ? null
        : data.collection_point_id,
    source_details: emptyToNull(data.source_details),
    notes: emptyToNull(data.notes),
  } satisfies arrivalDataInput;
};
