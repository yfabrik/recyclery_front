import z from "zod";
import {
  idSchema,
  nullString,
  optionalFilterIsoDate,
} from "../../interfaces/ZodTypes";
import { LABELED_ITEM_STATUS_FILTER_VALUES } from "../../constants/labeledItemStatuses";

export const labelFilterSchema = z.object({
  category_id: z.union([nullString(), z.null(), idSchema()]),
  search: z.string().trim().optional(),
  status: z.enum(LABELED_ITEM_STATUS_FILTER_VALUES),
  date_from: optionalFilterIsoDate(),
  date_to: optionalFilterIsoDate(),
});

export type LabelFilters = z.infer<typeof labelFilterSchema>;
export type LabelFilterInput = z.input<typeof labelFilterSchema>;

export const LABEL_FILTER_DEFAULTS = {
  status: "",
  category_id: "",
  search: "",
  date_from: null,
  date_to: null,
} as const satisfies LabelFilterInput;

export const toLabelFilterInput = (values: LabelFilters): LabelFilterInput => ({
  status: values.status,
  category_id: values.category_id ?? "",
  search: values.search ?? "",
  date_from: values.date_from ?? null,
  date_to: values.date_to ?? null,
});

export const parseLabelFilters = (input: LabelFilterInput): LabelFilters =>
  labelFilterSchema.parse(input);
