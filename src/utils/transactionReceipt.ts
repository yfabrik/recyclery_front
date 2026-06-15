import { toast } from "react-toastify";
import type {
  CategoryModel,
  TransactionModel,
  TransactionPayment,
} from "../interfaces/Models";
import type { CartItem } from "../components/forms/cartSchema";
import {
  getTransactionDetails,
  type CreateTransactionResponse,
} from "../services/api/transactions";
import { getTransactionGlobalPromotion } from "../services/cartService";

export type ReceiptSale = CreateTransactionResponse["data"]["sale"];

export type ReceiptPrintTrigger = (payload: {
  sale: ReceiptSale;
  items: CartItem[];
  cashSession: NonNullable<TransactionModel["CashSession"]>;
  user: NonNullable<NonNullable<TransactionModel["CashSession"]>["User"]>;
  global_promotion?: ReturnType<typeof getTransactionGlobalPromotion>;
}) => void;

export const buildReceiptSaleFromTransaction = (
  transaction: TransactionModel,
): ReceiptSale => ({
  id: transaction.id,
  total_amount: transaction.total_amount ?? 0,
  total_amount_before_promotion:
    transaction.total_amount_before_promotion ?? transaction.total_amount ?? 0,
  payment_method: transaction.payment_method,
  payment_amount: transaction.payment_amount ?? 0,
  transactionType: transaction.transactionType,
  customer_postal_code: transaction.customer_postal_code ?? null,
  status: transaction.status,
  cash_session_id: transaction.cash_session_id ?? null,
  created_by: transaction.created_by ?? null,
  createdAt: transaction.createdAt,
  updatedAt: transaction.updatedAt ?? transaction.createdAt,
  payments: transaction.payments as (TransactionPayment & {
    createdAt: string;
    updatedAt: string;
  })[],
});

export const buildCartItemsFromTransaction = (
  transaction: TransactionModel,
  categories?: CategoryModel[],
): CartItem[] =>
  (transaction.items ?? []).map((item) => {
    const txItem = item.TransactionItem;
    const category = categories?.find((c) => c.id === item.category_id);
    const subcategory = category?.subcategories?.find(
      (c) => c.id === item.subcategory_id,
    );
    return {
      name: txItem?.name ?? item.description ?? "",
      price: Number(txItem?.price ?? item.price ?? 0),
      quantity: Number(txItem?.quantity ?? 1),
      category_name: item.category?.name ?? category?.name ?? "",
      subcategory_name: item.subcategory?.name ?? subcategory?.name ?? "",
      barcode: item.barcode ?? "",
      category_id: item.category_id ?? 0,
      subcategory_id: item.subcategory_id ?? null,
      description: item.description ?? null,
      weight: Number(item.weight ?? 0),
      promotion: Number(txItem?.promotionValue ?? 0),
      bundlePrice:
        txItem?.bundlePrice != null ? Number(txItem.bundlePrice) : null,
      bundleQuantity: txItem?.bundleQuantity ?? null,
    };
  });

export const reprintTransactionReceipt = (
  transactionId: number,
  triggerPrintReceipt: ReceiptPrintTrigger,
) => {
  toast.success(
    `Réimpression du ticket de caisse ${transactionId} en cours...`,
  );

  getTransactionDetails(transactionId).then((response) => {
    const transaction = response.data.transaction;
    if (!transaction.CashSession || !transaction.CashSession.User) {
      toast.error(
        "Impossible de reimprimer: informations de session ou utilisateur manquantes.",
      );
      return;
    }

    triggerPrintReceipt({
      cashSession: transaction.CashSession,
      items: buildCartItemsFromTransaction(transaction),
      user: transaction.CashSession.User,
      sale: buildReceiptSaleFromTransaction(transaction),
      global_promotion: getTransactionGlobalPromotion(transaction),
    });
  });
};
