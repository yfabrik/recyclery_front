import z from "zod";
import {
  PAYMENT_METHOD_FILTER_VALUES,
  TRANSACTION_TYPE_FILTER_VALUES,
} from "../../interfaces/transactionConstants";
import { filterIsoDate, idSchema } from "../../interfaces/ZodTypes";
import { toIsoDate } from "../dateService";

/** URL / form state of the sales analytics filters. Not the API query: see `toSaleQuery` / `toSaleStatsQuery`. */
export const saleFilterFormSchema =z.object({
  store_id: z.union([idSchema(), z.literal("")]),
  period: z.enum(["week", "month", "custom"]), //TODO find enum
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
  transaction_number: z.string().trim().optional(),
});
export type SaleFilterFormValues = z.infer<typeof saleFilterFormSchema>;

export const getSaleFilterFormDefaults = (): SaleFilterFormValues => {
  const today = new Date();
  return {
    store_id: "",
    period: "month",
    date_from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    date_to: toIsoDate(today),
    transaction_number: "",
  };
};

/** URL / form state of the POS history filters. Not the API query: see `toSaleHistoryQuery`. */
export const saleHistoryFilterFormSchema =z.object({
  date_from: filterIsoDate(),
  date_to: filterIsoDate(),
  transaction_number: z.string().trim().optional(),
  transactionType: z.enum(TRANSACTION_TYPE_FILTER_VALUES).optional(),
  transactionMethod: z.enum(PAYMENT_METHOD_FILTER_VALUES).optional(),
});
export type SaleHistoryFilterFormValues = z.infer<typeof saleHistoryFilterFormSchema>;
export type SaleHistoryFilterFormInput = z.input<typeof saleHistoryFilterFormSchema>;

export const getSaleHistoryFilterFormDefaults = (): SaleHistoryFilterFormValues => {
  const today = new Date();
  return {
    date_from: toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
    date_to: toIsoDate(today),
    transaction_number: "",
    transactionType: "",
    transactionMethod: "",
  };
};
