import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  MONEY_COUNTER_STORAGE_KEYS,
  clearMoneyCounterCounts,
  moneyCounterPersistence,
  readMoneyCounterCounts,
  writeMoneyCounterCounts,
} from "./moneyCounterStorage";

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

beforeEach(() => {
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: createMemoryStorage(),
  });
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "localStorage");
});

describe("moneyCounterStorage", () => {
  it("writes and reads open counts", () => {
    writeMoneyCounterCounts(moneyCounterPersistence.open, {
      0.5: 3,
      10: 2,
      1: 0,
    });

    expect(readMoneyCounterCounts(moneyCounterPersistence.open)).toEqual({
      0.5: 3,
      10: 2,
    });
  });

  it("does not leak open counts into a close draft", () => {
    writeMoneyCounterCounts(moneyCounterPersistence.open, { 5: 4 });

    expect(
      readMoneyCounterCounts(moneyCounterPersistence.close(12)),
    ).toEqual({});
  });

  it("restores close counts only for the same session", () => {
    writeMoneyCounterCounts(moneyCounterPersistence.close(12), {
      20: 1,
      50: 2,
    });

    expect(readMoneyCounterCounts(moneyCounterPersistence.close(12))).toEqual({
      20: 1,
      50: 2,
    });
    expect(readMoneyCounterCounts(moneyCounterPersistence.close(13))).toEqual(
      {},
    );
  });

  it("returns empty counts for invalid JSON", () => {
    localStorage.setItem(MONEY_COUNTER_STORAGE_KEYS.open, "{not-json");

    expect(readMoneyCounterCounts(moneyCounterPersistence.open)).toEqual({});
  });

  it("returns empty counts for an invalid close payload", () => {
    localStorage.setItem(
      MONEY_COUNTER_STORAGE_KEYS.close,
      JSON.stringify({ sessionId: 1, counts: "nope" }),
    );

    expect(readMoneyCounterCounts(moneyCounterPersistence.close(1))).toEqual(
      {},
    );
  });

  it("clears the stored slot", () => {
    writeMoneyCounterCounts(moneyCounterPersistence.open, { 2: 8 });
    clearMoneyCounterCounts(moneyCounterPersistence.open);

    expect(readMoneyCounterCounts(moneyCounterPersistence.open)).toEqual({});
    expect(localStorage.getItem(MONEY_COUNTER_STORAGE_KEYS.open)).toBeNull();
  });

  it("removes the slot when all counts are zero", () => {
    writeMoneyCounterCounts(moneyCounterPersistence.open, { 5: 1 });
    writeMoneyCounterCounts(moneyCounterPersistence.open, { 5: 0 });

    expect(localStorage.getItem(MONEY_COUNTER_STORAGE_KEYS.open)).toBeNull();
  });
});
