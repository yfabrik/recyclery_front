import { describe, expect, it } from "vitest";
import { promoPayloadFromForm } from "../../src/services/mapper/promotion";
import { promoFormSchema } from "../../src/services/schema/promotion";

describe("promoFormSchema", () => {
  it("accepts null endDate", () => {
    const result = promoFormSchema.safeParse({
      category_id: 1,
      subcategory_id: "",
      promotionValue: 10,
      startDate: new Date("2026-01-01"),
      endDate: null,
      isActive: true,
      stores: [""],
    });
    expect(result.success).toBe(true);
  });
});

describe("promoPayloadFromForm", () => {
  it("maps null endDate to API null", () => {
    const payload = promoPayloadFromForm({
      category_id: 1,
      subcategory_id: "",
      promotionValue: 10,
      startDate: new Date("2026-01-15T12:00:00"),
      endDate: null,
      isActive: true,
      stores: [""],
    });
    expect(payload.endDate).toBeNull();
  });
});
