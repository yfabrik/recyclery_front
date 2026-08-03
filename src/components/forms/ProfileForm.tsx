import { zodResolver } from "@hookform/resolvers/zod";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  profileFormSchema,
  type ProfileFormOutput,
  type ProfileFormValues,
} from "../../services/schema/profile";
import { FormInput, type BaseFormProps } from "./FormBase";

export type { ProfileFormValues, ProfileFormOutput };

export const ProfileForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<ProfileFormValues, ProfileFormOutput>) => {
  const form = useForm<ProfileFormValues, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: defaultValues?.username ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
    },
  });

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
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
