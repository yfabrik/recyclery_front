import z from "zod";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
import { LABELED_ITEM_STATUS_FILTER_VALUES } from "../../constants/labeledItemStatuses";

export const filterSchema = z.object({
  category_id: z.union([idSchema(), nullString()]),
  search: z.string().trim().optional(),
  status: z.enum(LABELED_ITEM_STATUS_FILTER_VALUES),
});

export type Filters = z.infer<typeof filterSchema>;
export type FilterInput = z.input<typeof filterSchema>;

export const EMPTY_FILTER_INPUT = {
  status: "",
  category_id: "",
  search: "",
} as const satisfies FilterInput;

export const toFilterInput = (values: Filters): FilterInput => ({
  status: values.status,
  category_id: values.category_id ?? "",
  search: values.search ?? "",
});

export const parseFilters = (input: FilterInput): Filters =>
  filterSchema.parse(input);
