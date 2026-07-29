import type { SaleTransactionBaseInput } from "@recyclerie/api/schemas/salesTransactions";
import type { Schema as CartSchema } from "../components/forms/cartSchema";
import { buildTransactionBody } from "./transactionBody";

export const buildUpdateTransactionBody = (
  data: CartSchema,
  cashSessionId: number,
): SaleTransactionBaseInput => {
  return buildTransactionBody(data, cashSessionId, {
    normalizePostalCodeToNull: true,
  }) as SaleTransactionBaseInput;
};
