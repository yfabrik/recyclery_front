import { toIsoDate } from "@recyclerie/api/domain/date";
import { weekdaySchema } from "@recyclerie/api/primitives/zod";
import z from "zod";

// export const phoneSchema = z
//   .string()
//   .regex(/^[0-9+\-()\s]+$/, "Invalid phone");


export const phoneSchema = (message?: string) => z.string({ message }).trim().regex(/^(0|(\+[0-9]{2}[. -]?))[1-9]([. -]?[0-9][0-9]){4}$/, { message })

export const postalSchema = (message?: string) => z.string({ message }).trim().regex(/^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/, { message })

export const idSchema = (message?: string) => z.coerce.number({ message }).positive({ message })

export const noEmptyStr = (message?: string) => z.string({ message }).trim().nonempty({ message })

export const nullString = () => z.literal("").transform(() => null)

// export const optionalString = (message?: string) => z.string({ message }).transform(v=>v==""?null:v)

/** Form-friendly Weekday 0–6: RHF default `""`, preprocess then API weekdaySchema. */
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

function transformNullsToEmptyStrings<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.transform((obj) => {
    const result: Record<string, any> = {};
    for (const key in obj) {
      result[key] = obj[key] === null ? "" : obj[key];
    }
    return result;
  });
}

function transformEmptyStringsToNulls<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.transform((obj) => {
    const result: Record<string, any> = {};
    for (const key in obj) {
      result[key] = obj[key] === "" ? null : obj[key];
    }
    return result;
  });
}

