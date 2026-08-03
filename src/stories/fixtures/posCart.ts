import type { TransactionModel } from "../../interfaces/Models";
import type { CartFormOutput, CartItem } from "../../services/schema/cart";
import {
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  roundCurrency,
} from "../../services/cartService";

const nowIso = new Date().toISOString();

export const makeCartItem = (
  overrides: Partial<CartItem> & Pick<CartItem, "price" | "quantity" | "name">,
): CartItem => ({
  category_name: "Vêtements",
  subcategory_name: "Homme",
  barcode: "BC-1",
  category_id: 1,
  subcategory_id: 11,
  description: null,
  weight: 0.5,
  promotion: 0,
  bundlePrice: null,
  bundleQuantity: null,
  ...overrides,
});

export const floatThreeLinesCart: CartItem[] = [
  makeCartItem({ name: "A", price: 0.1, quantity: 3, barcode: "A" }),
  makeCartItem({ name: "B", price: 0.1, quantity: 3, barcode: "B" }),
  makeCartItem({ name: "C", price: 0.1, quantity: 3, barcode: "C" }),
];

export const packLineCart: CartItem[] = [
  makeCartItem({
    name: "Pack tee",
    price: 4.99,
    quantity: 3,
    bundlePrice: 9.99,
    bundleQuantity: 3,
    barcode: "PACK",
  }),
];

export const linePromoCart: CartItem[] = [
  makeCartItem({
    name: "Promo line",
    price: 3.33,
    quantity: 3,
    promotion: 10,
    barcode: "LP",
  }),
];

export const globalPromoCart: CartItem[] = [
  makeCartItem({ name: "One", price: 1, quantity: 1, barcode: "1" }),
  makeCartItem({ name: "Two", price: 2, quantity: 1, barcode: "2" }),
  makeCartItem({ name: "Three", price: 3, quantity: 1, barcode: "3" }),
];

export const fractionalGlobalPromoCart: CartItem[] = [
  makeCartItem({
    name: "Frac",
    price: 7.77,
    quantity: 3,
    barcode: "FRAC",
  }),
];

export const buildCartForm = (
  cart: CartItem[],
  options: {
    global_promotion?: CartFormOutput["global_promotion"];
    payment_splits?: CartFormOutput["payment_splits"];
  } = {},
): CartFormOutput => {
  const global_promotion = options.global_promotion ?? {
    type: "percent" as const,
    value: 0,
  };
  const total = getCartTotalWithGlobalPromotion(cart, global_promotion);
  const due = roundCurrency(total);
  return {
    cart,
    global_promotion,
    payment_splits: options.payment_splits ?? [
      {
        method: "cash",
        amount: due,
      },
    ],
    customer_postal_code: "",
  };
};

export const makeSellTransaction = (
  form: CartFormOutput,
  overrides: Partial<TransactionModel> = {},
): TransactionModel => {
  const subtotal = getCartTotal(form.cart);
  const total = getCartTotalWithGlobalPromotion(
    form.cart,
    form.global_promotion,
  );
  const due = roundCurrency(total);
  const payments = form.payment_splits
    .filter((s) => s.amount > 0)
    .map((split, index) => ({
      id: index + 1,
      method: split.method,
      amount: split.amount,
      metadata: null,
      sales_transaction_id: 9001,
      gift_card_id: null,
      createdAt: nowIso,
      updatedAt: nowIso,
    }));

  return {
    id: 9001,
    createdAt: nowIso,
    updatedAt: nowIso,
    change_amount: 0,
    total_amount: due,
    total_amount_before_promotion: roundCurrency(subtotal),
    payment_method: payments.length > 1 ? "mixed" : (payments[0]?.method ?? "cash"),
    transactionType: "sell",
    payment_amount: roundCurrency(
      payments.reduce((sum, p) => sum + p.amount, 0),
    ),
    status: "completed",
    created_by: 1,
    cash_session_id: 101,
    customer_name: null,
    customer_email: null,
    customer_postal_code: null,
    transactionId: null,
    global_promotion: form.global_promotion.value,
    global_promotion_type: form.global_promotion.type,
    payments,
    items: form.cart.map((item, index) => ({
      id: index + 1,
      createdAt: nowIso,
      updatedAt: nowIso,
      barcode: item.barcode,
      description: item.description ?? null,
      weight: item.weight,
      price: item.price,
      cost: null,
      condition_state: "good" as const,
      status: "sold" as const,
      category_id: item.category_id,
      subcategory_id: item.subcategory_id ?? null,
      recyclery_id: 1,
      created_by: 1,
      TransactionItem: {
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        promotionValue: item.promotion,
        bundleQuantity: item.bundleQuantity ?? null,
        bundlePrice: item.bundlePrice ?? null,
        total_price: item.quantity * item.price,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    })),
    ...overrides,
  };
};

export const globalPromo33Form = buildCartForm(globalPromoCart, {
  global_promotion: { type: "percent", value: 33 },
});

export const fractionalGlobalPromo10Form = buildCartForm(
  fractionalGlobalPromoCart,
  {
    global_promotion: { type: "percent", value: 10 },
  },
);

export const multiPayForm = (() => {
  const cart = [
    makeCartItem({ name: "Cash part", price: 10, quantity: 1 }),
    makeCartItem({ name: "Card part", price: 5, quantity: 1, barcode: "CARD" }),
  ];
  return buildCartForm(cart, {
    payment_splits: [
      { method: "cash", amount: 10 },
      { method: "card", amount: 5 },
    ],
  });
})();
