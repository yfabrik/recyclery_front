import type { FieldErrors } from "react-hook-form";

/**
 * Recursively collects every error message from a react-hook-form errors tree.
 *
 * Handles the cases the naive `Object.values(errors).map(e => e.message)` misses:
 * - field-array root errors stored under `.root` (e.g. `payment_splits.root.message`)
 * - nested per-item errors (e.g. `payment_splits[0].amount.message`)
 * - nested object fields
 *
 * Messages are de-duplicated while preserving their first-seen order.
 */
export const collectFormErrorMessages = (
  errors: FieldErrors,
): string[] => {
  const messages: string[] = [];
  const seen = new Set<string>();

  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;

    const record = node as Record<string, unknown>;
    const message = record.message;
    if (typeof message === "string" && message && !seen.has(message)) {
      seen.add(message);
      messages.push(message);
    }

    for (const [key, value] of Object.entries(record)) {
      // `ref` points at the field's DOM node / element and must not be traversed.
      if (key === "ref" || key === "message" || key === "type") continue;
      visit(value);
    }
  };

  visit(errors);
  return messages;
};
