import z from "zod";
import { optionalFormDate, requiredPositiveNumber } from "../../interfaces/ZodTypes";

export const createGiftCardSchema = z.object({
    initial_value: requiredPositiveNumber("Le montant initial est requis"),
    expires_at: optionalFormDate(),
    note: z.string(),
    recipient_name: z.string(),
    recipient_email: z.union([z.literal(""), z.email()]),
  });
  export type CreateGiftCardFormValues = z.input<typeof createGiftCardSchema>;
    export type CreateGiftCardFormOutput = z.infer<typeof createGiftCardSchema>;