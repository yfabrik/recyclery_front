import z from "zod";
import {
  optionalId,
  requiredFormId,
  requiredPercentNumber,
} from "../../interfaces/ZodTypes";

export const promoFormSchema = z.object({
  category_id: requiredFormId("categorie requis"),
  subcategory_id: optionalId(),
  promotionValue: requiredPercentNumber("promotion requise"),
  startDate: z.date("date de début requise"),
  endDate: z.union([z.literal(""), z.date()]),
  isActive: z.boolean(),
  stores: z.array(z.union([z.literal(""), z.number().positive()])),
});

export type PromoFormOutput = z.infer<typeof promoFormSchema>;
export type PromoFormValues = z.input<typeof promoFormSchema>;
