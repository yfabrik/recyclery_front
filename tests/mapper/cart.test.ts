import { describe, expect, it } from "vitest";
import {
  buildTransactionBody,
  buildUpdateTransactionBody,
} from "../../src/services/mapper/cart";
import {
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  roundCurrency,
} from "../../src/services/cartService";
import {
  fractionalGlobalPromo10Form,
  globalPromo33Form,
  makeCartItem,
  multiPayForm,
} from "../../src/stories/fixtures/posCart";

describe("buildTransactionBody", () => {
  it("maps totals and global promo for fractional cart", () => {
    const data = fractionalGlobalPromo10Form;
    const body = buildTransactionBody(data, 101, {
      normalizePostalCodeToNull: false,
      includeTotalPrice: true,
    });

    const subtotal = getCartTotal(data.cart);
    const total = getCartTotalWithGlobalPromotion(
      data.cart,
      data.global_promotion,
    );

    expect(body.cash_session_id).toBe(101);
    expect(body.total_amount_before_promotion).toBe(roundCurrency(subtotal));
    expect(body.total_amount).toBe(roundCurrency(total));
    expect(body.global_promotion).toBe(10);
    expect(body.global_promotion_type).toBe("percent");
    expect(body.payment_amount).toBe(roundCurrency(total));
    expect(body.items[0]).toMatchObject({
      name: "Frac",
      price: 7.77,
      quantity: 3,
      promotion: 0,
      total_price: 7.77 * 3,
    });
  });

  it("keeps bundle fields and filters zero payment splits", () => {
    const data = {
      cart: [
        makeCartItem({
          name: "Pack",
          price: 4.99,
          quantity: 3,
          bundlePrice: 9.99,
          bundleQuantity: 3,
          promotion: 5,
        }),
      ],
      global_promotion: { type: "fixed" as const, value: 1 },
      payment_splits: [
        { method: "cash" as const, amount: 0 },
        { method: "card" as const, amount: 8.99 },
      ],
      customer_postal_code: "59000" as const,
    };

    const body = buildTransactionBody(data, 55);

    expect(body.payments).toEqual([
      { method: "card", amount: 8.99, gift_card_code: undefined },
    ]);
    expect(body.items[0]).toMatchObject({
      bundlePrice: 9.99,
      bundleQuantity: 3,
      promotion: 5,
    });
    expect(body.global_promotion).toBe(1);
    expect(body.global_promotion_type).toBe("fixed");
    expect(body.customer_postal_code).toBe("59000");
  });

  it("maps multi payment methods", () => {
    const body = buildTransactionBody(multiPayForm, 101);
    expect(body.payments).toEqual([
      { method: "cash", amount: 10, gift_card_code: undefined },
      { method: "card", amount: 5, gift_card_code: undefined },
    ]);
    expect(body.payment_amount).toBe(15);
    expect(body.total_amount).toBe(15);
  });
});

describe("buildUpdateTransactionBody", () => {
  it("keeps global promo in totals (edit regression lock)", () => {
    const data = globalPromo33Form;
    const createBody = buildTransactionBody(data, 101);
    const updateBody = buildUpdateTransactionBody(data, 101);

    expect(updateBody.global_promotion).toBe(33);
    expect(updateBody.global_promotion_type).toBe("percent");
    expect(updateBody.total_amount).toBe(createBody.total_amount);
    expect(updateBody.total_amount_before_promotion).toBe(
      createBody.total_amount_before_promotion,
    );
    expect(updateBody.total_amount).toBe(4.02);
    expect(updateBody.total_amount_before_promotion).toBe(6);
  });

  it("normalizes empty postal code to null", () => {
    const body = buildUpdateTransactionBody(
      {
        ...globalPromo33Form,
        customer_postal_code: "",
      },
      101,
    );
    expect(body.customer_postal_code).toBeNull();
  });
});
