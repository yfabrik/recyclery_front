import { describe, expect, it } from "vitest";
import { getTransactionGlobalPromotion } from "../../src/services/cartService";
import {
  buildTransactionBody,
  buildUpdateTransactionBody,
} from "../../src/services/mapper/cart";
import { buildTransactionCartFormValues } from "../../src/utils/editTransactionDefaults";
import { mockCategories } from "../../src/stories/fixtures";
import {
  fractionalGlobalPromo10Form,
  globalPromo33Form,
  makeSellTransaction,
} from "../../src/stories/fixtures/posCart";

describe("getTransactionGlobalPromotion", () => {
  it("reads virtual global_promotion fields", () => {
    expect(
      getTransactionGlobalPromotion({
        global_promotion: 33,
        global_promotion_type: "percent",
        globalPromotions: undefined,
      }),
    ).toEqual({ type: "percent", value: 33 });
  });

  it("falls back to globalPromotions[0]", () => {
    expect(
      getTransactionGlobalPromotion({
        global_promotion: null,
        global_promotion_type: null,
        globalPromotions: [
          {
            id: 1,
            value: 10,
            type: "percent",
            transaction_id: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      }),
    ).toEqual({ type: "percent", value: 10 });
  });
});

describe("buildTransactionCartFormValues", () => {
  it("hydrates global promo and round-trips update totals", () => {
    const transaction = makeSellTransaction(globalPromo33Form);
    const formValues = buildTransactionCartFormValues(
      transaction,
      mockCategories,
    );

    expect(formValues.global_promotion).toEqual({
      type: "percent",
      value: 33,
    });
    expect(formValues.cart).toHaveLength(3);
    expect(formValues.payment_splits[0]?.amount).toBe(4.02);

    const updateBody = buildUpdateTransactionBody(formValues, 101);
    const createBody = buildTransactionBody(globalPromo33Form, 101);

    expect(updateBody.total_amount).toBe(createBody.total_amount);
    expect(updateBody.global_promotion).toBe(33);
    expect(updateBody.global_promotion_type).toBe("percent");
  });

  it("round-trips fractional global promo totals", () => {
    const transaction = makeSellTransaction(fractionalGlobalPromo10Form);
    const formValues = buildTransactionCartFormValues(
      transaction,
      mockCategories,
    );
    const updateBody = buildUpdateTransactionBody(formValues, 101);
    const createBody = buildTransactionBody(fractionalGlobalPromo10Form, 101);

    expect(formValues.global_promotion).toEqual({
      type: "percent",
      value: 10,
    });
    expect(updateBody.total_amount).toBe(createBody.total_amount);
    expect(updateBody.total_amount).toBe(20.98);
  });

  it("hydrates from relation when virtual fields are missing", () => {
    const base = makeSellTransaction(globalPromo33Form, {
      global_promotion: null,
      global_promotion_type: null,
      globalPromotions: [
        {
          id: 9,
          value: 33,
          type: "percent",
          transaction_id: 9001,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    const formValues = buildTransactionCartFormValues(base, mockCategories);
    expect(formValues.global_promotion).toEqual({
      type: "percent",
      value: 33,
    });

    const updateBody = buildUpdateTransactionBody(formValues, 101);
    expect(updateBody.total_amount).toBe(4.02);
  });
});
