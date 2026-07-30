import { describe, expect, it } from "vitest";
import { donFormSchema } from "../../src/services/schema/don";

describe("donFormSchema", () => {
  it("rejects empty weight", () => {
    const result = donFormSchema.safeParse({
      donor_name: "Alice",
      donor_email: "",
      donor_phone: "",
      item_description: "Livre",
      estimated_value: 10,
      weight: "",
      status: "pending",
    });
    expect(result.success).toBe(false);
  });

  it("accepts numeric weight and value", () => {
    const result = donFormSchema.safeParse({
      donor_name: "Alice",
      donor_email: "",
      donor_phone: "",
      item_description: "Livre",
      estimated_value: 10,
      weight: 2.5,
      status: "pending",
    });
    expect(result.success).toBe(true);
  });
});
