import { describe, expect, it } from "vitest";
import { cartFormSchema } from "../../src/services/schema/cart";
import {
  getCartTotalWithGlobalPromotion,
  roundCurrency,
} from "../../src/services/cartService";
import {
  buildCartForm,
  fractionalGlobalPromo10Form,
  makeCartItem,
  multiPayForm,
} from "../../src/stories/fixtures/posCart";

describe("cartFormSchema payment gate", () => {
  it("accepts pay equal to rounded due with float noise", () => {
    const result = cartFormSchema.safeParse(fractionalGlobalPromo10Form);
    expect(result.success).toBe(true);
  });

  it("rejects underpay", () => {
    const due = roundCurrency(
      getCartTotalWithGlobalPromotion(fractionalGlobalPromo10Form.cart, {
        type: "percent",
        value: 10,
      }),
    );
    const result = cartFormSchema.safeParse({
      ...fractionalGlobalPromo10Form,
      payment_splits: [{ method: "cash", amount: due - 0.01 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          issue.path.includes("payment_splits"),
        ),
      ).toBe(true);
    }
  });

  it("accepts multi-method splits that sum to due", () => {
    const result = cartFormSchema.safeParse(multiPayForm);
    expect(result.success).toBe(true);
  });

  it("accepts classic 0.10 float cart when paying rounded total", () => {
    const form = buildCartForm([
      makeCartItem({ name: "A", price: 0.1, quantity: 3 }),
      makeCartItem({ name: "B", price: 0.1, quantity: 3, barcode: "B" }),
      makeCartItem({ name: "C", price: 0.1, quantity: 3, barcode: "C" }),
    ]);
    expect(form.payment_splits[0]?.amount).toBe(0.9);
    expect(cartFormSchema.safeParse(form).success).toBe(true);
  });
});
