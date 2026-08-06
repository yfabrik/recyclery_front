import { describe, expect, it } from "vitest";
import { createGiftCardPayloadFromForm } from "../../src/services/mapper/giftcard";
import { createGiftCardSchema } from "../../src/services/schema/giftcard";
import type { CreateGiftCardFormOutput } from "../../src/services/schema/giftcard";

const validForm = {
  initial_value: 25,
  expires_at: null,
  note: "",
  recipient_name: "",
  recipient_email: "",
};

describe("createGiftCardSchema", () => {
  it("rejects empty initial_value", () => {
    const result = createGiftCardSchema.safeParse({
      ...validForm,
      initial_value: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive initial_value", () => {
    const result = createGiftCardSchema.safeParse({
      ...validForm,
      initial_value: 0,
    });
    expect(result.success).toBe(false);
  });

  it("accepts positive amount with empty email and null expires_at", () => {
    const result = createGiftCardSchema.safeParse(validForm);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.initial_value).toBe(25);
      expect(result.data.expires_at).toBeNull();
      expect(result.data.recipient_email).toBe("");
    }
  });

  it("rejects invalid recipient_email", () => {
    const result = createGiftCardSchema.safeParse({
      ...validForm,
      recipient_email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("createGiftCardPayloadFromForm", () => {
  it("maps null expires_at to null", () => {
    const payload = createGiftCardPayloadFromForm({
      ...validForm,
      expires_at: null,
    } satisfies CreateGiftCardFormOutput);
    expect(payload.expires_at).toBeNull();
  });

  it("maps empty email, name and note to null", () => {
    const payload = createGiftCardPayloadFromForm({
      ...validForm,
      note: "",
      recipient_name: "",
      recipient_email: "",
    } satisfies CreateGiftCardFormOutput);
    expect(payload.note).toBeNull();
    expect(payload.recipient_name).toBeNull();
    expect(payload.recipient_email).toBeNull();
  });

  it("keeps positive initial_value and formats expires_at as ISO date", () => {
    const payload = createGiftCardPayloadFromForm({
      ...validForm,
      initial_value: 40,
      expires_at: new Date("2026-08-15T12:00:00"),
      recipient_email: "alice@example.com",
      recipient_name: "Alice",
      note: "Cadeau",
    } satisfies CreateGiftCardFormOutput);
    expect(payload.initial_value).toBe(40);
    expect(payload.expires_at).toBe("2026-08-15");
    expect(payload.recipient_email).toBe("alice@example.com");
    expect(payload.recipient_name).toBe("Alice");
    expect(payload.note).toBe("Cadeau");
    expect(payload.code).toMatch(/^GC-/);
  });
});
