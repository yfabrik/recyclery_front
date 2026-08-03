import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  passwordChangeFormSchema,
  passwordChangeFormSchemaWithCurrent,
  type PasswordChangeFormOutput,
  type PasswordChangeFormValues,
} from "../../services/schema/password";
import { FormPasswordInput, type BaseFormProps } from "./FormBase";

export type {
  PasswordChangeFormOutput,
  PasswordChangeFormValues,
};
/** @deprecated Use PasswordChangeFormOutput */
export type Schema = PasswordChangeFormOutput;

interface PasswordChangeFormProps
  extends BaseFormProps<PasswordChangeFormValues, PasswordChangeFormOutput> {
  /** Require the current password to confirm identity (self-service flow). */
  requireCurrentPassword?: boolean;
}

export const PasswordChangeForm = ({
  formId,
  onSubmit,
  requireCurrentPassword = false,
}: PasswordChangeFormProps) => {
  const form = useForm<
    PasswordChangeFormValues,
    unknown,
    PasswordChangeFormOutput
  >({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: zodResolver(
      requireCurrentPassword
        ? passwordChangeFormSchemaWithCurrent
        : passwordChangeFormSchema,
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
