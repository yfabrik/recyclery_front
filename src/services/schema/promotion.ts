import z from "zod";
import { nullString } from "../../interfaces/ZodTypes";
import { idSchema } from "@recyclerie/api/primitives/zod";
import { toIsoDate } from "../dateService";

export const promoFormSchema = z.object({
    category_id: idSchema("categorie requis"),
    subcategory_id: z.union([nullString(),idSchema()]),
    promotionValue: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.coerce.number("valeur doit etre en 0 et 100").min(0).max(100),
    ),
    startDate: z.coerce.date().transform((val) => toIsoDate(val)),
    endDate: z.preprocess(
      (v) => (v === "" || v == null ? null : v),
      z.union([
        z.null(),
        z.coerce.date().transform((val) => toIsoDate(val)),
      ]),
    ),
    isActive: z.boolean(),
    stores: z
        .array(z.union([z.literal(""),idSchema()]))//TODO remake cleaner
        .transform((value) => {
            if (value.length === 1 && value[0] === "") return null
            return value.filter((store): store is number => typeof store === "number")
        })
})

export type PromoFormOutput = z.infer<typeof promoFormSchema>
export type PromoFormValues = z.input<typeof promoFormSchema>
