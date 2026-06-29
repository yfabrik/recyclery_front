import { useForm } from "react-hook-form";
import { FormPasswordInput, type BaseFormProps } from "./FormBase";
import z from "zod";
import { noEmptyStr } from "../../interfaces/ZodTypes";
import { zodResolver } from "@hookform/resolvers/zod";

const baseSchema = z.object({
  newPassword: noEmptyStr("champ requis").min(
    6,
    "Le mot de passe doit contenir au moins 6 caractères",
  ),
  confirmPassword: noEmptyStr("champ requis").min(
    6,
    "Le mot de passe doit contenir au moins 6 caractères",
  )})


const matchOptions = {
  message: "les champs doivent etre egaux",
  path: ["confirmPassword"],
};

const passwordsMatch = (v: {
  newPassword: string;
  confirmPassword: string;
}) => v.confirmPassword == v.newPassword;

const schema = z
  .object({
    currentPassword: z.string().optional(),
    ...baseSchema.shape,
  })
  .refine(passwordsMatch, matchOptions);

const schemaWithCurrent = z
  .object({
    currentPassword: noEmptyStr("champ requis"),
    ...baseSchema.shape,
  })
  .refine(passwordsMatch, matchOptions);

export type Schema = z.infer<typeof schema>;

interface PasswordChangeFormProps extends BaseFormProps<Schema> {
  /** Require the current password to confirm identity (self-service flow). */
  requireCurrentPassword?: boolean;
}

export const PasswordChangeForm = ({
  formId,
  onSubmit,
  requireCurrentPassword = false,
}: PasswordChangeFormProps) => {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(
      requireCurrentPassword ? schemaWithCurrent : schema,
    ),
  });
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      {requireCurrentPassword && (
        <FormPasswordInput
          control={form.control}
          name="currentPassword"
          label="Mot de passe actuel"
          extra={{ margin: "normal" }}
        />
      )}
      <FormPasswordInput
        control={form.control}
        name="newPassword"
        label="Nouveau mot de passe"
        extra={{ margin: "normal" }}
      />
      <FormPasswordInput
        control={form.control}
        name="confirmPassword"
        label="Confirmer le nouveau mot de passe"
        extra={{ margin: "normal" }}
      />
    </form>
  );
};
