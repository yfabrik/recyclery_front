import z from "zod";
import {
  PAYMENT_METHOD_FILTER_VALUES,
  TRANSACTION_TYPE_FILTER_VALUES,
} from "../../interfaces/transactionConstants";
import { filterIsoDate, idSchema } from "../../interfaces/ZodTypes";
import { toIsoDate } from "../dateService";

export const saleFilterSchema = z.object({
  store_id: z.union([idSchema(), z.literal("")]),
  period: z.enum(["week", "month", "custom"]), //TODO find enum
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
  transaction_number: z.string().trim().optional(),
});
export type SaleFilters = z.infer<typeof saleFilterSchema>;

export const getSaleFilterDefaults = (): SaleFilters => {
  const today = new Date();
  return {
    store_id: "",
    period: "month",
    date_from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    date_to: toIsoDate(today),
    transaction_number: "",
  };
};

export const saleHistoryFilterSchema = z.object({
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
  transaction_number: z.string().trim().optional(),
  transactionType: z.enum(TRANSACTION_TYPE_FILTER_VALUES).optional(),
  transactionMethod: z.enum(PAYMENT_METHOD_FILTER_VALUES).optional(),
});
export type SaleHistoryFilters = z.infer<typeof saleHistoryFilterSchema>;

export const getSaleHistoryFilterDefaults = (): SaleHistoryFilters => {
  const today = new Date();
  return {
    date_from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    date_to: toIsoDate(today),
    transaction_number: "",
    transactionType: "",
    transactionMethod: "",
  };
};
