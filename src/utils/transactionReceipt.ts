import { toast } from "react-toastify";
import type { AuthUserModel } from "../interfaces/Models";
import type { UserRefDto } from "@recyclerie/api/responses/refs";
import type { CartItem } from "../components/forms/cartSchema";
import { getTransactionDetails } from "../services/api/transactions";
import type {
  SalesTransactionDto,
  SalesTransactionItemDto,
} from "@recyclerie/api/responses/salesTransactions";
import type { CategoryDto } from "@recyclerie/api/responses/categories";
import { getTransactionGlobalPromotion } from "../services/cartService";

export type ReceiptSale = SalesTransactionDto;

export type ReceiptPrintTrigger = (payload: {
  sale: ReceiptSale;
  items: CartItem[];
  cashSession: NonNullable<SalesTransactionDto["CashSession"]>;
  user: AuthUserModel | UserRefDto;
  global_promotion?: ReturnType<typeof getTransactionGlobalPromotion>;
}) => void;

const getReceiptLineItems = (
  items: SalesTransactionDto["items"],
): SalesTransactionItemDto[] => items ?? [];

export const buildReceiptSaleFromTransaction = (
  transaction: SalesTransactionDto,
): ReceiptSale => ({ ...transaction });

export const buildCartItemsFromTransaction = (
  transaction: SalesTransactionDto,
  categories?: CategoryDto[],
): CartItem[] =>
  getReceiptLineItems(transaction.items).map((item) => {
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
    const transaction = response.data.data;
    if (!transaction.CashSession || !transaction.CashSession.User) {
      toast.error(
        "Impossible de reimprimer: informations de session ou utilisateur manquantes.",
      );
      return;
    }

    triggerPrintReceipt({
      sale: buildReceiptSaleFromTransaction(transaction),
      items: buildCartItemsFromTransaction(transaction),
      cashSession: transaction.CashSession,
      user: transaction.CashSession.User,
      global_promotion: getTransactionGlobalPromotion(transaction),
    });
  });
};
