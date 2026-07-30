import { describe, expect, it } from "vitest";
import { categoryFormSchema } from "../../src/services/schema/category";

const validBase = {
  name: "Cat",
  description: "",
  icon: "Home",
  defaultPrice: 5,
  defaultWeight: 1,
  parent_id: null,
  priceBasedOnWeight: false,
  bundlePrice: "",
  bundleQuantity: "",
};

describe("categoryFormSchema", () => {
  it("accepts numeric default and bundle fields", () => {
    const result = categoryFormSchema.safeParse({
      ...validBase,
      bundlePrice: 10,
      bundleQuantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects string numbers for defaults", () => {
    const result = categoryFormSchema.safeParse({
      ...validBase,
      defaultPrice: "5" as unknown as number,
      defaultWeight: "1" as unknown as number,
    });
    expect(result.success).toBe(false);
  });
});
