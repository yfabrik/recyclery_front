import type { Schema as CartSchema } from "../components/forms/cartSchema";
import type { UpdateTransactionBody } from "../services/api/transactions";
import { buildTransactionBody } from "./transactionBody";

export const buildUpdateTransactionBody = (
  data: CartSchema,
  cashSessionId: number,
): UpdateTransactionBody => {
  return buildTransactionBody(data, cashSessionId, {
    normalizePostalCodeToNull: true,
  }) as UpdateTransactionBody;
};
