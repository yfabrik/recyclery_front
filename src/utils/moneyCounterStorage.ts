export const MONEY_COUNTER_STORAGE_KEYS = {
  open: "recyclerie.moneyCounter.open",
  close: "recyclerie.moneyCounter.close",
} as const satisfies Record<"open" | "close", string>;

export type MoneyCounterPersistence =
  | { readonly kind: "open" }
  | { readonly kind: "close"; readonly sessionId: number };

export const moneyCounterPersistence = {
  open: { kind: "open" },
  close: (
    sessionId: number,
  ): Extract<MoneyCounterPersistence, { kind: "close" }> => ({
    kind: "close",
    sessionId,
  }),
} as const satisfies {
  open: Extract<MoneyCounterPersistence, { kind: "open" }>;
  close: (
    sessionId: number,
  ) => Extract<MoneyCounterPersistence, { kind: "close" }>;
};

export type MoneyCounterCounts = Record<number, number>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCounts(value: unknown): MoneyCounterCounts | null {
  if (!isRecord(value)) return null;

  const counts: MoneyCounterCounts = {};
  for (const [key, raw] of Object.entries(value)) {
    const denom = Number(key);
    if (!Number.isFinite(denom)) return null;
    if (typeof raw !== "number" || !Number.isInteger(raw) || raw < 0) {
      return null;
    }
    if (raw > 0) {
      counts[denom] = raw;
    }
  }
  return counts;
}

function compactCounts(counts: MoneyCounterCounts): MoneyCounterCounts {
  const compacted: MoneyCounterCounts = {};
  for (const [key, count] of Object.entries(counts)) {
    if (count > 0) {
      compacted[Number(key)] = count;
    }
  }
  return compacted;
}

function storageKey(kind: MoneyCounterPersistence["kind"]): string {
  return MONEY_COUNTER_STORAGE_KEYS[kind];
}

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / private-mode errors
  }
}

function removeRaw(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
}

function parseStoredValue(raw: string | null): unknown {
  if (raw == null || raw === "") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readMoneyCounterCounts(
  persistence: MoneyCounterPersistence,
): MoneyCounterCounts {
  const parsed = parseStoredValue(readRaw(storageKey(persistence.kind)));

  if (persistence.kind === "open") {
    return parseCounts(parsed) ?? {};
  }

  if (!isRecord(parsed)) return {};
  if (parsed.sessionId !== persistence.sessionId) return {};
  return parseCounts(parsed.counts) ?? {};
}

export function writeMoneyCounterCounts(
  persistence: MoneyCounterPersistence,
  counts: MoneyCounterCounts,
): void {
  const compacted = compactCounts(counts);
  const key = storageKey(persistence.kind);

  if (Object.keys(compacted).length === 0) {
    removeRaw(key);
    return;
  }

  if (persistence.kind === "open") {
    writeRaw(key, JSON.stringify(compacted));
    return;
  }

  writeRaw(
    key,
    JSON.stringify({
      sessionId: persistence.sessionId,
      counts: compacted,
    }),
  );
}

export function clearMoneyCounterCounts(
  persistence: MoneyCounterPersistence,
): void {
  removeRaw(storageKey(persistence.kind));
}
