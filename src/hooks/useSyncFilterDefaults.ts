import { useEffect, useRef } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { stableSerializeFilters } from "./useUrlFilters";

/**
 * Resets the form when external defaultValues change (e.g. URL back/forward),
 * but skips when the change is an echo of values this form just emitted.
 */
export function useSyncFilterDefaults<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  defaultValues: TFieldValues,
) {
  const lastEmittedRef = useRef(stableSerializeFilters(defaultValues as Record<string, unknown>));

  useEffect(() => {
    const next = stableSerializeFilters(defaultValues as Record<string, unknown>);
    if (next === lastEmittedRef.current) return;
    form.reset(defaultValues);
    lastEmittedRef.current = next;
  }, [defaultValues, form]);

  const markEmitted = (values: TFieldValues) => {
    lastEmittedRef.current = stableSerializeFilters(values as Record<string, unknown>);
  };

  return markEmitted;
}
