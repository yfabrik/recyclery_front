import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";
import type { z } from "zod";
import { toIsoDate } from "../services/dateService";

const PAGE_PARAM = "page";

export function serializeFilterValue(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return toIsoDate(value);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

export function stableSerializeFilters(values: Record<string, unknown>): string {
  const entries = Object.keys(values)
    .sort()
    .map((key) => {
      const serialized = serializeFilterValue(values[key]);
      return `${key}:${serialized ?? ""}`;
    });
  return entries.join("|");
}

function valuesEqual(a: unknown, b: unknown): boolean {
  return serializeFilterValue(a) === serializeFilterValue(b);
}

function buildSearchParams<T extends Record<string, unknown>>(
  filters: T,
  defaults: T,
  page: number | undefined,
  withPage: boolean,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const key of Object.keys(filters) as (keyof T & string)[]) {
    const value = filters[key];
    if (valuesEqual(value, defaults[key])) continue;
    const serialized = serializeFilterValue(value);
    if (serialized == null) continue;
    params.set(key, serialized);
  }

  if (withPage && page != null && page > 1) {
    params.set(PAGE_PARAM, String(page));
  }

  return params;
}

function parseFiltersFromParams<T extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  schema: z.ZodType<T>,
  defaults: T,
): T {
  const raw: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(defaults)) {
    const param = searchParams.get(key);
    if (param == null) continue;
    raw[key] = param;
  }

  const parsed = schema.safeParse(raw);
  return parsed.success ? parsed.data : defaults;
}

function parsePage(searchParams: URLSearchParams): number {
  const raw = searchParams.get(PAGE_PARAM);
  if (raw == null) return 1;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

type UseUrlFiltersBaseOptions<T extends Record<string, unknown>> = {
  schema: z.ZodType<T>;
  defaults: T;
};

type UseUrlFiltersWithPageOptions<T extends Record<string, unknown>> =
  UseUrlFiltersBaseOptions<T> & { withPage: true };

type UseUrlFiltersWithoutPageOptions<T extends Record<string, unknown>> =
  UseUrlFiltersBaseOptions<T> & { withPage?: false };

export function useUrlFilters<T extends Record<string, unknown>>(
  options: UseUrlFiltersWithPageOptions<T>,
): {
  filters: T;
  setFilters: (values: T) => void;
  page: number;
  setPage: (page: number) => void;
};

export function useUrlFilters<T extends Record<string, unknown>>(
  options: UseUrlFiltersWithoutPageOptions<T>,
): {
  filters: T;
  setFilters: (values: T) => void;
};

export function useUrlFilters<T extends Record<string, unknown>>(
  options: UseUrlFiltersWithPageOptions<T> | UseUrlFiltersWithoutPageOptions<T>,
) {
  const { schema, defaults } = options;
  const withPage = options.withPage === true;
  const [searchParams, setSearchParams] = useSearchParams();

  const defaultsKey = useMemo(
    () => stableSerializeFilters(defaults),
    [defaults],
  );

  const filters = useMemo(
    () => parseFiltersFromParams(searchParams, schema, defaults),
    // defaultsKey captures defaults content; schema is stable module export
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams, schema, defaultsKey],
  );

  const page = useMemo(
    () => (withPage ? parsePage(searchParams) : 1),
    [searchParams, withPage],
  );

  const write = useCallback(
    (nextFilters: T, nextPage: number) => {
      setSearchParams(buildSearchParams(nextFilters, defaults, nextPage, withPage), {
        replace: true,
      });
    },
    [defaults, setSearchParams, withPage],
  );

  const setFilters = useCallback(
    (values: T) => {
      write(values, 1);
    },
    [write],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      write(filters, nextPage);
    },
    [filters, write],
  );

  if (withPage) {
    return { filters, setFilters, page, setPage };
  }

  return { filters, setFilters };
}
