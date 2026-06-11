type ApiMessagePayload = {
  message?: unknown;
  error?: unknown;
};

const asNonEmptyString = (value: unknown): string | undefined =>
  typeof value === "string" && value.length > 0 ? value : undefined;

const getResponsePayload = (data: unknown): ApiMessagePayload | undefined => {
  if (!data || typeof data !== "object") return undefined;

  const record = data as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as ApiMessagePayload;
  }
  return record as ApiMessagePayload;
};

/** Prefer API `message`, then legacy `error`, then fallback. */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  const data = (error as { response?: { data?: ApiMessagePayload } })?.response
    ?.data;
  return (
    asNonEmptyString(data?.message) ??
    asNonEmptyString(data?.error) ??
    fallback
  );
};

/** Prefer API `message` from a success response, then fallback. */
export const getApiSuccessMessage = (
  response: unknown,
  fallback: string,
): string =>
  asNonEmptyString(getResponsePayload(response)?.message) ?? fallback;
