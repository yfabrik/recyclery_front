/** Drop keys whose value is `null` or `undefined` (does not convert `""`). */
export function omitNullish<T extends object>(obj: T): Partial<T> {
  return Object.entries(obj).reduce<Partial<T>>((prev, [key, value]) => {
    if (value != null) {
      (prev as Record<string, unknown>)[key] = value;
    }
    return prev;
  }, {});
}

/**
 * Drop keys whose value is `""`, `null` or `undefined`.
 * Used by filter query mappers to omit "no filter" sentinels from the request.
 */
export function omitBlank<T extends object>(
  obj: T,
): { [K in keyof T]?: Exclude<T[K], "" | null | undefined> } {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== "" && value != null,
    ),
  ) as { [K in keyof T]?: Exclude<T[K], "" | null | undefined> };
}

/** `""` → `null` for optional form strings before API payload shaping. */
export const emptyToNull = (value: string): string | null =>
  value === "" ? null : value;

/**
 * @deprecated Misnamed — drops nullish keys, does not convert `""`. Prefer `omitNullish`.
 */
export const emptyStringToNull = (obj: object): Record<string, unknown> =>
  omitNullish(obj) as Record<string, unknown>;
