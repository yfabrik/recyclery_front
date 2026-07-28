import z from "zod";
import { VACATION_REASON_VALUES } from "../../constants/vacationReasons";

export const vacationFormSchema = z
  .object({
    start_date: z.coerce.date("Date de début requise"),
    end_date: z.coerce.date("Date de fin requise"),
    reason: z
      .union([z.literal(""), z.enum(VACATION_REASON_VALUES)])
      .refine((value) => value !== "", { message: "Motif requis" })
      .pipe(z.enum(VACATION_REASON_VALUES)),
  })
  .superRefine((data, ctx) => {
    if (data.end_date < data.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message:
          "La date de fin doit être postérieure ou égale à la date de début",
      });
    }
  });

export type VacationFormOutput = z.infer<typeof vacationFormSchema>;
export type VacationFormValues = z.input<typeof vacationFormSchema>;

export const VACATION_FORM_DEFAULTS: Partial<VacationFormValues> = {
  reason: "",
};
