import z from "zod";

// export const phoneSchema = z
//   .string()
//   .regex(/^[0-9+\-()\s]+$/, "Invalid phone");


export const phoneSchema = (message?: string) => z.string({ message }).regex(/^(0|(\+[0-9]{2}[. -]?))[1-9]([. -]?[0-9][0-9]){4}$/, { message })

export const postalSchema = (message?: string) => z.string({ message }).regex(/^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/, { message })

export const idSchema = (message?: string) => z.coerce.number({ message }).positive({ message })

export const noEmptyStr = (message?: string) => z.string({ message }).trim().nonempty({ message })

export const nullString = () => z.literal("").transform(() => null)

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

