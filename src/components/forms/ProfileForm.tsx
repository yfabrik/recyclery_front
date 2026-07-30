import { zodResolver } from "@hookform/resolvers/zod";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  profilePayloadFromForm,
  type ProfileFormPayload,
} from "../../services/mapper/profile";
import {
  profileFormSchema,
  type ProfileFormOutput,
  type ProfileFormValues,
} from "../../services/schema/profile";
import { FormInput, type BaseFormProps } from "./FormBase";

export type { ProfileFormValues, ProfileFormOutput, ProfileFormPayload };
/** @deprecated Use ProfileFormPayload */
export type Schema = ProfileFormPayload;

export const ProfileForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<ProfileFormValues, ProfileFormPayload>) => {
  const form = useForm<ProfileFormValues, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: defaultValues?.username ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
    },
  });

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit((data) =>
        onSubmit(profilePayloadFromForm(data)),
      )}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Nom d'utilisateur"
            name="username"
            extra={{ size: "small" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Email"
            name="email"
            extra={{ size: "small", type: "email" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Téléphone"
            name="phone"
            extra={{ size: "small" }}
          />
        </Grid>
      </Grid>
    </form>
  );
};
