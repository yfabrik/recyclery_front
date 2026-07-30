import { phoneSchema } from "@recyclerie/api/primitives/zod";
import z from "zod";
import { noEmptyStr } from "../../interfaces/ZodTypes";

export const profileFormSchema = z.object({
  username: noEmptyStr("Nom d'utilisateur requis"),
  email: z.email("Email invalide"),
  phone: z.union([z.literal(""), phoneSchema("Numéro de téléphone invalide")]),
});

export type ProfileFormValues = z.input<typeof profileFormSchema>;
export type ProfileFormOutput = z.infer<typeof profileFormSchema>;
