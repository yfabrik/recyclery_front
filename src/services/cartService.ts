import type { CartItem } from "../components/forms/cartSchema";
import type { CategoryModel, TransactionModel } from "../interfaces/Models";

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

export const getPaymentMethodLabel = (
  method: TransactionModel["payment_method"],
) => {
  const labels = {
    cash: "Espèces",
    card: "Carte bancaire",
    check: "Chèque",
    giftcard: "avoir",
    // Backward-compatible in case some UI paths still send the old casing.
    giftCard: "avoir",
  };
  return labels[method] || method;
};


export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount || 0);
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
  //TODO handle mixed
  return transactions.reduce((prev, current) =>
    current.payment_method === "cash" ?
      current.transactionType == "sell" ?
        prev + current.total_amount :
        prev - current.total_amount :
      prev, openingAmount)

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