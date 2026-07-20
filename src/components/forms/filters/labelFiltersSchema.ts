import z from "zod";
import { idSchema, nullString } from "../../../interfaces/ZodTypes";
import { LABELED_ITEM_STATUS_FILTER_VALUES } from "../../../constants/labeledItemStatuses";

export const filterSchema = z.object({
  category_id: z.union([nullString(), z.null(), idSchema()]),
  search: z.string().trim().optional(),
  status: z.enum(LABELED_ITEM_STATUS_FILTER_VALUES),
  date_from: z.coerce.date().nullish(),
  date_to: z.coerce.date().nullish(),
});

export type Filters = z.infer<typeof filterSchema>;
export type FilterInput = z.input<typeof filterSchema>;

export const EMPTY_FILTER_INPUT = {
  status: "",
  category_id: "",
  search: "",
  date_from: null,
  date_to: null,
} as const satisfies FilterInput;


//TODO  comprend pas l'utilité
export const toFilterInput = (values: Filters): FilterInput => ({
  status: values.status,
  category_id: values.category_id ?? "",
  search: values.search ?? "",
  date_from: values.date_from ?? null,
  date_to: values.date_to ?? null,
});

export const parseFilters = (input: FilterInput): Filters =>
  filterSchema.parse(input);
