import { formatCurrency } from "../services/cartService";

/** Normalize Intl/NBSP spaces so Testing Library text queries stay reliable. */
export const normalizeMoneyText = (value: string) =>
  value.replace(/[\s\u00a0\u202f]/g, " ").trim();

/**
 * Matcher for exact currency text on a leaf node (avoids matching parent rows).
 * Use with `getByText(matchFormattedCurrency(4.02))`.
 */
export const matchFormattedCurrency = (amount: number, prefix = "") => {
  const expected = normalizeMoneyText(`${prefix}${formatCurrency(amount)}`);
  return (_content: string, element: Element | null) => {
    if (!element || element.children.length > 0) return false;
    return normalizeMoneyText(element.textContent ?? "") === expected;
  };
};
