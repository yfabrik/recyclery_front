import z from "zod";
import { noEmptyStr, optionalId } from "../../interfaces/ZodTypes";

export const openCaisseFormSchema = z.object({
  store_id: optionalId("store requis").refine((v): v is number => v !== "", {
    message: "store requis",
  }),
  cash_register_id: optionalId("caisse requis").refine(
    (v): v is number => v !== "",
    { message: "caisse requis" },
  ),
  opening_amount: z
    .union([z.literal(""), z.number().positive("solde requis")])
    .refine((v): v is number => v !== "", { message: "solde requis" }),
  notes: z.string(),
});

export type OpenCaisseFormValues = z.input<typeof openCaisseFormSchema>;
export type OpenCaisseFormOutput = z.infer<typeof openCaisseFormSchema>;

export const closeCaisseFormSchema = z.object({
  closing_amount: z
    .union([
      z.literal(""),
      z
        .number("Veuillez saisir le montant de fermeture")
        .positive("Veuillez saisir le montant de fermeture"),
    ])
    .refine((v): v is number => v !== "", {
      message: "Veuillez saisir le montant de fermeture",
    }),
  notes: z.string(),
});

export type CloseCaisseFormValues = z.input<typeof closeCaisseFormSchema>;
export type CloseCaisseFormOutput = z.infer<typeof closeCaisseFormSchema>;

export const createCaisseFormSchema = z.object({
  name: noEmptyStr("nom requis"),
});

export type CreateCaisseFormValues = z.input<typeof createCaisseFormSchema>;
export type CreateCaisseFormOutput = z.infer<typeof createCaisseFormSchema>;
