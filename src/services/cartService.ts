import type { CartItem } from "../components/forms/cartSchema";
import type { TransactionModel } from "../interfaces/Models";

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

// export const formatWeight = (amount: number) => {
//   return new Intl.NumberFormat("fr-FR", {
//     style: "unit",
//     unit: "kilogram",
//   }).format(amount || 0);
// };
