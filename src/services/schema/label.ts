import z from "zod";
import {
  idSchema,
  nullString,
  optionalFilterIsoDate,
} from "../../interfaces/ZodTypes";
import { LABELED_ITEM_STATUS_FILTER_VALUES } from "../../constants/labeledItemStatuses";

/** URL / form state of the label filters. Not the API query: see `toLabeledItemQuery`. */
export const labelFilterFormSchema =z.object({
  category_id: z.union([nullString(), z.null(), idSchema()]),
  search: z.string().trim().optional(),
  status: z.enum(LABELED_ITEM_STATUS_FILTER_VALUES),
  date_from: optionalFilterIsoDate(),
  date_to: optionalFilterIsoDate(),
});

export type LabelFilterFormValues = z.infer<typeof labelFilterFormSchema>;
export type LabelFilterFormInput = z.input<typeof labelFilterFormSchema>;

export const LABEL_FILTER_FORM_DEFAULTS = {
  status: "",
  category_id: "",
  search: "",
  date_from: null,
  date_to: null,
} as const satisfies LabelFilterFormInput;

export const toLabelFilterFormInput = (values: LabelFilterFormValues): LabelFilterFormInput => ({
  status: values.status,
  category_id: values.category_id ?? "",
  search: values.search ?? "",
  date_from: values.date_from ?? null,
  date_to: values.date_to ?? null,
});
