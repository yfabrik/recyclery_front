import z from "zod";
import {
  itemSchema,
  type CartItem,
} from "../services/schema/cart";

export const POS_CART_STORAGE_KEY = "recyclerie.pos.carts";

const posCartDraftSchema = z.object({
  sessionId: z.number().int().positive(),
  tabValue: z.number().int().nonnegative(),
  carts: z.array(z.array(itemSchema)).min(1),
});

export type PosCartDraft = z.infer<typeof posCartDraftSchema>;

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

export function snapshotPosCarts(
  carts: readonly CartItem[][],
  tabValue: number,
  currentCart: readonly CartItem[],
): CartItem[][] {
  const clonedCurrent = currentCart.map((item) => ({ ...item }));
  if (carts.length === 0) {
    return [clonedCurrent];
  }

  const next = carts.map((tab) => tab.map((item) => ({ ...item })));
  const lastIndex = next.length - 1;
  const index = Math.min(Math.max(tabValue, 0), lastIndex);
  next[index] = clonedCurrent;
  return next;
}

export function readPosCartDraft(sessionId: number): PosCartDraft | null {
  const parsed = posCartDraftSchema.safeParse(
    parseStoredValue(readRaw(POS_CART_STORAGE_KEY)),
  );
  if (!parsed.success) return null;
  if (parsed.data.sessionId !== sessionId) return null;

  const lastIndex = parsed.data.carts.length - 1;
  return {
    sessionId: parsed.data.sessionId,
    tabValue: Math.min(parsed.data.tabValue, lastIndex),
    carts: parsed.data.carts,
  } satisfies PosCartDraft;
}

export function writePosCartDraft(
  sessionId: number,
  draft: Pick<PosCartDraft, "tabValue" | "carts">,
): void {
  const parsed = posCartDraftSchema.safeParse({
    sessionId,
    tabValue: draft.tabValue,
    carts: draft.carts,
  });
  if (!parsed.success) return;

  writeRaw(POS_CART_STORAGE_KEY, JSON.stringify(parsed.data));
}

export function clearPosCartDraft(): void {
  removeRaw(POS_CART_STORAGE_KEY);
}
