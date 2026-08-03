import { describe, expect, it } from "vitest";
import {
  getCartLinePrice,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  getGlobalPromotionDiscount,
  isPaymentInsufficient,
  roundCurrency,
} from "../../src/services/cartService";

const line = (
  overrides: Partial<{
    quantity: number;
    price: number;
    promotion: number;
    bundlePrice: number | null;
    bundleQuantity: number | null;
  }> = {},
) => ({
  quantity: 1,
  price: 0,
  promotion: 0,
  bundlePrice: null as number | null,
  bundleQuantity: null as number | null,
  ...overrides,
});

describe("cart math (float-test scenarios)", () => {
  it("three lines 0.10 x3 (classic float)", () => {
    const cart = [
      line({ price: 0.1, quantity: 3 }),
      line({ price: 0.1, quantity: 3 }),
      line({ price: 0.1, quantity: 3 }),
    ];
    const subtotal = getCartTotal(cart);
    const total = getCartTotalWithGlobalPromotion(cart);
    const rounded = roundCurrency(total);

    expect(subtotal).toBeCloseTo(0.9, 10);
    expect(total).toBeCloseTo(0.9, 10);
    expect(rounded).toBe(0.9);
    expect(isPaymentInsufficient(rounded, total)).toBe(false);
  });

  it("line promo 10% — price 3.33 qty 3", () => {
    const cart = [line({ price: 3.33, quantity: 3, promotion: 10 })];
    const lineTotal = getCartLinePrice(cart[0]!);
    const total = getCartTotalWithGlobalPromotion(cart);
    const rounded = roundCurrency(total);

    expect(lineTotal).toBeCloseTo(3.33 * 3 * 0.9, 10);
    expect(total).toBeCloseTo(8.991, 10);
    expect(rounded).toBe(8.99);
    expect(isPaymentInsufficient(rounded, total)).toBe(false);
  });

  it("global promo 33% on 1+2+3", () => {
    const cart = [
      line({ price: 1, quantity: 1 }),
      line({ price: 2, quantity: 1 }),
      line({ price: 3, quantity: 1 }),
    ];
    const promo = { type: "percent" as const, value: 33 };
    const subtotal = getCartTotal(cart);
    const discount = getGlobalPromotionDiscount(subtotal, promo);
    const total = getCartTotalWithGlobalPromotion(cart, promo);
    const rounded = roundCurrency(total);

    expect(subtotal).toBe(6);
    expect(discount).toBeCloseTo(1.98, 10);
    expect(total).toBeCloseTo(4.02, 10);
    expect(rounded).toBe(4.02);
    expect(isPaymentInsufficient(rounded, total)).toBe(false);
  });

  it("global promo 10% — 7.77 x3", () => {
    const cart = [line({ price: 7.77, quantity: 3 })];
    const promo = { type: "percent" as const, value: 10 };
    const subtotal = getCartTotal(cart);
    const total = getCartTotalWithGlobalPromotion(cart, promo);
    const rounded = roundCurrency(total);

    expect(subtotal).toBeCloseTo(23.31, 10);
    expect(total).toBeCloseTo(20.979, 10);
    expect(rounded).toBe(20.98);
    expect(isPaymentInsufficient(rounded, total)).toBe(false);
  });

  it("bundle 3 for 9.99 — unit 4.99 qty 3", () => {
    const cart = [
      line({
        price: 4.99,
        quantity: 3,
        bundlePrice: 9.99,
        bundleQuantity: 3,
      }),
    ];
    expect(getCartLinePrice(cart[0]!)).toBeCloseTo(9.99, 10);
    expect(getCartTotal(cart)).toBeCloseTo(9.99, 10);
    expect(
      isPaymentInsufficient(roundCurrency(9.99), getCartTotal(cart)),
    ).toBe(false);
  });

  it("mixed lines + line promos + 5% global", () => {
    const cart = [
      line({ price: 1.11, quantity: 3, promotion: 5 }),
      line({ price: 2.22, quantity: 2, promotion: 0 }),
      line({ price: 0.07, quantity: 7 }),
    ];
    const promo = { type: "percent" as const, value: 5 };
    const subtotal = getCartTotal(cart);
    const total = getCartTotalWithGlobalPromotion(cart, promo);
    const rounded = roundCurrency(total);

    const expectedSubtotal =
      1.11 * 3 * 0.95 + 2.22 * 2 + 0.07 * 7;
    expect(subtotal).toBeCloseTo(expectedSubtotal, 10);
    expect(total).toBeCloseTo(expectedSubtotal * 0.95, 10);
    expect(isPaymentInsufficient(rounded, total)).toBe(false);
  });
});

describe("cart math — sell scenarios", () => {
  it("multi-item without promo", () => {
    const cart = [
      line({ price: 2.5, quantity: 2 }),
      line({ price: 1.25, quantity: 4 }),
    ];
    expect(getCartTotal(cart)).toBe(10);
    expect(getCartTotalWithGlobalPromotion(cart)).toBe(10);
  });

  it("line promo only", () => {
    const cart = [line({ price: 10, quantity: 2, promotion: 20 })];
    expect(getCartLinePrice(cart[0]!)).toBe(16);
    expect(getCartTotalWithGlobalPromotion(cart)).toBe(16);
  });

  it("pack + leftover qty (qty 5, bundleQuantity 3)", () => {
    const cart = [
      line({
        price: 4.99,
        quantity: 5,
        bundlePrice: 9.99,
        bundleQuantity: 3,
      }),
    ];
    // 1 pack @ 9.99 + 2 units @ 4.99
    expect(getCartLinePrice(cart[0]!)).toBeCloseTo(9.99 + 2 * 4.99, 10);
  });

  it("multi payment splits vs due", () => {
    const due = getCartTotalWithGlobalPromotion(
      [line({ price: 10, quantity: 1 })],
      { type: "percent", value: 10 },
    );
    expect(due).toBe(9);
    expect(isPaymentInsufficient(5 + 4, due)).toBe(false);
    expect(isPaymentInsufficient(5 + 3.99, due)).toBe(true);
  });

  it("paying rounded total is not blocked by raw float epsilon", () => {
    const cart = [
      line({ price: 0.1, quantity: 3 }),
      line({ price: 0.1, quantity: 3 }),
      line({ price: 0.1, quantity: 3 }),
    ];
    const total = getCartTotalWithGlobalPromotion(cart);
    const userPays = roundCurrency(total);
    // Raw compare can look "underpaid" due to float; gate must use cents.
    expect(userPays < total).toBe(true);
    expect(isPaymentInsufficient(userPays, total)).toBe(false);
  });
});
