import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { CartItem } from "../services/schema/cart";
import {
  POS_CART_STORAGE_KEY,
  clearPosCartDraft,
  readPosCartDraft,
  snapshotPosCarts,
  writePosCartDraft,
} from "./posCartStorage";

function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key) {
      return data.get(key) ?? null;
    },
    key(index) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key) {
      data.delete(key);
    },
    setItem(key, value) {
      data.set(String(key), String(value));
    },
  };
}

const shirt = {
  quantity: 2,
  price: 5,
  name: "Tee",
  category_name: "Vêtements",
  subcategory_name: "Homme",
  barcode: "TEE-1",
  category_id: 1,
  subcategory_id: 11,
  description: null,
  weight: 0.4,
  promotion: 0,
  bundlePrice: null,
  bundleQuantity: null,
} satisfies CartItem;

const book = {
  quantity: 1,
  price: 3,
  name: "Livre",
  category_name: "Livres",
  subcategory_name: "Roman",
  barcode: "BK-1",
  category_id: 2,
  subcategory_id: 21,
  description: "occasion",
  weight: 0.3,
  promotion: 10,
  bundlePrice: null,
  bundleQuantity: null,
} satisfies CartItem;

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("posCartStorage", () => {
  it("writes and reads multiple cart tabs", () => {
    writePosCartDraft(12, {
      tabValue: 1,
      carts: [[shirt], [book], []],
    });

    expect(readPosCartDraft(12)).toEqual({
      sessionId: 12,
      tabValue: 1,
      carts: [[shirt], [book], []],
    });
  });

  it("does not restore a draft from another session", () => {
    writePosCartDraft(12, {
      tabValue: 0,
      carts: [[shirt]],
    });

    expect(readPosCartDraft(13)).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    localStorage.setItem(POS_CART_STORAGE_KEY, "{not-json");

    expect(readPosCartDraft(12)).toBeNull();
  });

  it("returns null for an invalid payload", () => {
    localStorage.setItem(
      POS_CART_STORAGE_KEY,
      JSON.stringify({ sessionId: 12, tabValue: 0, carts: "nope" }),
    );

    expect(readPosCartDraft(12)).toBeNull();
  });

  it("clamps tabValue into the carts range", () => {
    localStorage.setItem(
      POS_CART_STORAGE_KEY,
      JSON.stringify({
        sessionId: 12,
        tabValue: 99,
        carts: [[shirt], [book]],
      }),
    );

    expect(readPosCartDraft(12)?.tabValue).toBe(1);
  });

  it("clears the stored draft", () => {
    writePosCartDraft(12, {
      tabValue: 0,
      carts: [[shirt]],
    });
    clearPosCartDraft();

    expect(readPosCartDraft(12)).toBeNull();
    expect(localStorage.getItem(POS_CART_STORAGE_KEY)).toBeNull();
  });

  it("merges the current form cart into the active tab", () => {
    expect(
      snapshotPosCarts([[shirt], []], 1, [book]),
    ).toEqual([[shirt], [book]]);
  });
});
