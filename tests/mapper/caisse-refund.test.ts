import { describe, expect, it } from "vitest";
import {
  closeCaissePayloadFromForm,
  openCaissePayloadFromForm,
} from "../../src/services/mapper/caisse";
import { refundPayloadFromForm } from "../../src/services/mapper/refund";

describe("openCaissePayloadFromForm", () => {
  it("maps empty notes to null", () => {
    const payload = openCaissePayloadFromForm({
      store_id: 1,
      cash_register_id: 2,
      opening_amount: 50,
      notes: "",
    });
    expect(payload.notes).toBeNull();
  });
});

describe("closeCaissePayloadFromForm", () => {
  it("maps empty notes to null", () => {
    const payload = closeCaissePayloadFromForm({
      closing_amount: 100,
      notes: "",
    });
    expect(payload.notes).toBeNull();
  });
});

describe("refundPayloadFromForm", () => {
  it("maps empty gift_card_code to null", () => {
    const payload = refundPayloadFromForm({
      cart: [],
      refund_reason: "customer_request",
      refund_method: "cash",
      gift_card_code: "",
      notes: "",
    });
    expect(payload.gift_card_code).toBeNull();
  });
});
