import { toIsoDate } from "@recyclerie/api/domain/date";
import { weekdaySchema } from "@recyclerie/api/primitives/zod";
import z from "zod";

export const phoneSchema = (message?: string) =>
  z
    .string({ message })
    .trim()
    .regex(/^(0|(\+[0-9]{2}[. -]?))[1-9]([. -]?[0-9][0-9]){4}$/, {
      message,
    });

export const postalSchema = (message?: string) =>
  z
    .string({ message })
    .trim()
    .regex(/^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/, { message });

/**
 * @deprecated Prefer `optionalId` / `z.number().positive()` in form schemas.
 * Coerce skews z.input vs z.infer (RHF setValue → never). Filters may keep using this.
 */
export const idSchema = (message?: string) =>
  z.coerce.number({ message }).positive({ message });

/** Form optional FK: empty select = `""`, chosen row = number. */
export const optionalId = (message?: string) =>
  z.union([z.literal(""), z.number().positive({ message })]);

/**
 * Required form id: input `"" | number`, output `number` after refine.
 * Keeps RHF field state as `"" | number`; mappers receive a number.
 */
export const requiredFormId = (message?: string) =>
  optionalId(message).refine((v): v is number => v !== "", {
    message: message ?? "requis",
  });

/** Optional numeric form field: unset = `""`. */
export const optionalFormNumber = (message?: string) =>
  z.union([z.literal(""), z.number({ error: message })]);

/**
 * Required positive number: input `"" | number`, output `number` after refine.
 * Use `""` defaults so the user must fill the field.
 */
export const requiredPositiveNumber = (message?: string) =>
  z
    .union([
      z.literal(""),
      z.number({ error: message }).positive({ error: message ?? "requis" }),
    ])
    .refine((v): v is number => v !== "", {
      message: message ?? "requis",
    });

/**
 * Required number ≥ 0: input `"" | number`, output `number` after refine.
 */
export const requiredNonNegativeNumber = (message?: string) =>
  z
    .union([
      z.literal(""),
      z.number({ error: message }).min(0, { error: message ?? "requis" }),
    ])
    .refine((v): v is number => v !== "", {
      message: message ?? "requis",
    });

/**
 * Required 0–100 percent: input `"" | number`, output `number` after refine.
 */
export const requiredPercentNumber = (message?: string) =>
  z
    .union([
      z.literal(""),
      z
        .number({ error: message })
        .min(0, { error: message ?? "0–100" })
        .max(100, { error: message ?? "0–100" }),
    ])
    .refine((v): v is number => v !== "", {
      message: message ?? "requis",
    });

export const noEmptyStr = (message?: string) =>
  z.string({ message }).trim().nonempty({ message });

/**
 * @deprecated Prefer `z.string()` / `optionalId` in form schemas + `emptyToNull` in mappers.
 * Transform skews z.input vs z.infer. Filters may keep using this until migrated.
 */
export const nullString = () => z.literal("").transform(() => null);

/**
 * Form weekday: `""` while unset, else 0–6.
 */
export const formWeekday = (message?: string) =>
  z.union([
    z.literal(""),
    z
      .number({ error: message ?? "choisissez un jour" })
      .int()
      .min(0, { error: message ?? "jour 0–6 requis" })
      .max(6, { error: message ?? "jour 0–6 requis" }),
  ]);

/**
 * Required weekday: input `"" | number`, output `0…6` after refine.
 */
export const requiredFormWeekday = (message?: string) =>
  formWeekday(message).refine(
    (v): v is 0 | 1 | 2 | 3 | 4 | 5 | 6 => v !== "",
    { message: message ?? "choisissez un jour" },
  );

/**
 * @deprecated Prefer `formWeekday` in form schemas. Preprocess + API weekdaySchema skew input/output.
 * Keep for any remaining non-form callers until migrated.
 */
export const weekDays = (message?: string) =>
  z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    weekdaySchema(message ?? "choisissez un jour"),
  );

/** Coerce Date/string → YYYY-MM-DD for API isoDate filter params. */
export const filterIsoDate = (message?: string) =>
  z.coerce.date({ message }).transform((val) => toIsoDate(val));

/** Optional filter date; empty/null stays null. */
export const optionalFilterIsoDate = () =>
  z.preprocess(
    (v) => (v === "" || v == null ? null : v),
    z.union([z.null(), filterIsoDate()]),
  );
