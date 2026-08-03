import z from "zod";
import { noEmptyStr } from "../../interfaces/ZodTypes";

const basePasswordFields = {
  newPassword: noEmptyStr("champ requis").min(
    6,
    "Le mot de passe doit contenir au moins 6 caractères",
  ),
  confirmPassword: noEmptyStr("champ requis").min(
    6,
    "Le mot de passe doit contenir au moins 6 caractères",
  ),
};

const matchOptions = {
  message: "les champs doivent etre egaux",
  path: ["confirmPassword"] as PropertyKey[],
};

const passwordsMatch = (v: {
  newPassword: string;
  confirmPassword: string;
}) => v.confirmPassword == v.newPassword;

export const passwordChangeFormSchema = z
  .object({
    currentPassword: z.string().optional(),
    ...basePasswordFields,
  })
  .refine(passwordsMatch, matchOptions);

export const passwordChangeFormSchemaWithCurrent = z
  .object({
    currentPassword: noEmptyStr("champ requis"),
    ...basePasswordFields,
  })
  .refine(passwordsMatch, matchOptions);

export type PasswordChangeFormValues = z.input<typeof passwordChangeFormSchema>;
export type PasswordChangeFormOutput = z.infer<typeof passwordChangeFormSchema>;
