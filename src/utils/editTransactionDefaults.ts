import type { CategoryModel, TransactionModel } from "../interfaces/Models";
import type { CartFormOutput as CartSchema } from "../services/schema/cart";
import { getTransactionGlobalPromotion } from "../services/cartService";
import { buildCartItemsFromTransaction } from "./transactionReceipt";

const buildInitialPaymentSplits = (
  transaction: TransactionModel,
): CartSchema["payment_splits"] => {
  if (transaction.payments?.length) {
    return transaction.payments.map((payment) => ({
      method: payment.method,
      amount: Number(payment.amount),
      gift_card_barcode: undefined,
      gift_card_id: undefined,
      gift_card_current_value: undefined,
    }));
  }

  if (transaction.payment_method === "mixed") {
    return [{ method: "cash", amount: Number(transaction.total_amount) }];
  }

  return [
    {
      method: transaction.payment_method,
      amount: Number(
        transaction.payment_amount ?? transaction.total_amount,
      ),
      gift_card_barcode: undefined,
      gift_card_id: undefined,
      gift_card_current_value: undefined,
    },
  ];
};

export const buildTransactionCartFormValues = (
  transaction: TransactionModel,
  categories?: CategoryModel[],
): CartSchema => ({
  cart: buildCartItemsFromTransaction(transaction, categories),
  global_promotion: getTransactionGlobalPromotion(transaction),
  payment_splits: buildInitialPaymentSplits(transaction),
  customer_postal_code: transaction.customer_postal_code ?? "",
});
