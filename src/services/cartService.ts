import type { CartItem } from "../components/forms/cartSchema";
import type { CategoryModel, TransactionModel } from "../interfaces/Models";

export type GlobalPromotionType = "percent" | "fixed";

export interface GlobalPromotionInput {
  type: GlobalPromotionType;
  value: number;
}

export const getCartLinePrice = (line: CartItem): number => {
  let bundles = 0;
  let extraItems = line.quantity;
  if (line.bundleQuantity && line.bundleQuantity !== 0) {
    bundles = Math.trunc(line.quantity / line.bundleQuantity);
    extraItems = line.quantity % line.bundleQuantity;
  }
  const sum = (price: number, quantity: number) =>
    price * quantity * (1 - line.promotion / 100);
  return (
    sum(line.price, extraItems) + sum(line.bundlePrice || line.price, bundles)
  );
};

export const getCartTotal = (cart: CartItem[]) => {
  return cart.reduce(
    (prev, current) =>
    (prev +=
      getCartLinePrice(current)),
    0,
  );
};

export const getGlobalPromotionDiscount = (
  subtotal: number,
  promotion?: GlobalPromotionInput | null,
) => {
  if (!promotion) return 0;
  const normalizedValue = Math.max(Number(promotion.value) || 0, 0);
  const discount =
    promotion.type === "percent"
      ? subtotal * (Math.min(normalizedValue, 100) / 100)
      : normalizedValue;
  return Math.min(discount, subtotal);
};

export const getCartTotalWithGlobalPromotion = (
  cart: CartItem[],
  promotion?: GlobalPromotionInput | null,
) => {
  const subtotal = getCartTotal(cart);
  const discount = getGlobalPromotionDiscount(subtotal, promotion);
  return Math.max(subtotal - discount, 0);
};

export const getTransactionGlobalPromotion = (
  transaction: Pick<TransactionModel, "global_promotion" | "global_promotion_type">,
): GlobalPromotionInput => ({
  type: transaction.global_promotion_type ?? "percent",
  value: Number(transaction.global_promotion ?? 0),
});

export const getTransactionSubtotal = (
  transaction: Pick<TransactionModel, "total_amount" | "total_amount_before_promotion">,
) => Number(transaction.total_amount_before_promotion ?? transaction.total_amount);

export const getTransactionGlobalPromotionDiscount = (
  transaction: Pick<TransactionModel, "total_amount" | "total_amount_before_promotion">,
) => Math.max(getTransactionSubtotal(transaction) - Number(transaction.total_amount), 0);

export const getPaymentMethodLabel = (
  method: TransactionModel["payment_method"],
) => {
  const labels = {
    cash: "Espèces",
    card: "Carte bancaire",
    check: "Chèque",
    giftcard: "avoir",
    mixed: "Mixte",
    transfer: "Virement"
    // Backward-compatible in case some UI paths still send the old casing.
    // giftCard: "avoir",
  } as const satisfies Record<TransactionModel["payment_method"], string>;
  return labels[method] || method;
};


export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount || 0);
};

/**
 * Round to EUR cents (same precision as {@link formatCurrency}).
 * Use for payment comparisons and amounts shown to the cashier — not for cart math or API payloads.
 */
export const roundCurrency = (amount: number) => {
  const parts = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(amount || 0);
  let normalized = "";
  for (const part of parts) {
    if (part.type === "integer" || part.type === "group") {
      normalized += part.value.replace(/\s/g, "");
    } else if (part.type === "decimal") {
      normalized += ".";
    } else if (part.type === "fraction") {
      normalized += part.value;
    }
  }
  return Number(normalized) || 0;
};

/** Compare paid vs due at cent precision (avoids float noise blocking checkout). */
export const isPaymentInsufficient = (totalPaid: number, cartTotal: number) =>
  roundCurrency(totalPaid) < roundCurrency(cartTotal);

/** Cent-rounded paid/due and change (+) or remaining (-) for payment UI. */
export const getPaymentBalance = (totalPaid: number, cartTotal: number) => {
  const paid = roundCurrency(totalPaid);
  const due = roundCurrency(cartTotal);
  const delta = paid - due;
  return {
    paid,
    due,
    change: delta > 0 ? delta : 0,
    remaining: delta < 0 ? -delta : 0,
  };
};

/** Whether a cash-session écart is non-zero at cent precision (display / alerts). */
export const hasSignificantCashDifference = (difference: number) =>
  roundCurrency(Math.abs(difference)) > 0;

/** Cent-rounded expected vs counted for caisse close UI and bilan print. */
export const getCashSessionBalance = (expected: number, counted: number) => {
  const expectedDisplay = roundCurrency(expected);
  const countedDisplay = roundCurrency(counted);
  const differenceDisplay = expectedDisplay - countedDisplay;
  return {
    expected,
    counted,
    expectedDisplay,
    countedDisplay,
    difference: expected - counted,
    differenceDisplay,
    isBalanced: differenceDisplay === 0,
  };
};

export const formatWeight = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "unit",
    unit: "kilogram",
  }).format(amount || 0);
};

export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value || 0);
};

export const sumPromoCategorie = (categorie?: CategoryModel) => {
  return categorie?.Promotions?.reduce((prev, current) => prev += current.promotionValue, 0) || 0
}

// export const formatWeight = (amount: number) => {
//   return new Intl.NumberFormat("fr-FR", {
//     style: "unit",
//     unit: "kilogram",
//   }).format(amount || 0);
// };


export const sumCashInPayments = (transactions: TransactionModel[], openingAmount: number = 0) => {
    return transactions.reduce((prev, current) => {
    if (current.payment_method == "cash")
      return current.transactionType == "sell" ?
        prev + current.total_amount :
        prev - current.total_amount
    if (!current.payments || current.payments.filter(payment => payment.method == "cash").length == 0)
      return prev

    const cashPayment = current.payments.reduce((acc, pay) => pay.method == "cash" ? acc : acc - pay.amount, current.total_amount)
    return current.transactionType == "sell" ?
      prev + cashPayment :
      prev - cashPayment

  }, 0)
  //TODO handle mixed
  // return transactions.reduce((prev, current) => {
  //   if (!current.payments)
  //     return current.payment_method === "cash" ?
  //       current.transactionType == "sell" ?
  //         prev + current.total_amount :
  //         prev - current.total_amount :
  //       prev
  //   const payments = current.payments.reduce((p, c) => c.method == "cash" ? p += c.amount : p, 0)
  //   if (current.transactionType == 'sell')
  //     prev += payments
  //   else
  //     prev -= payments
  //   return prev
  // }, openingAmount)

  return transactions.reduce((prev: number, current) => {
    // Calculate total cash in payments array, if payments present (i.e. for "mixed" payments)
    if (Array.isArray(current.payments) && current.payments.length > 0) {
      const totalCashInPayments = current.payments.reduce((p, c) =>
        c.method === "cash" ? p + c.amount : p,
        0
      );
      // Only add to prev if actual cash present in payments
      if (totalCashInPayments !== 0) {
        return prev + totalCashInPayments;
      }
    }
    // Otherwise, if the transaction's payment_method is "cash", add its total_amount
    if (current.payment_method === "cash") {
      return prev + current.total_amount;
    }
    // Otherwise, leave accumulator unchanged
    return prev;
  }, openingAmount)
}