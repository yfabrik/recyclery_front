import { zodResolver } from "@hookform/resolvers/zod";
import { phoneSchema } from "@recyclerie/api/primitives/zod";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { noEmptyStr } from "../../interfaces/ZodTypes";
import { emptyToNull } from "../../services/zodTransform";
import { FormInput, type BaseFormProps } from "./FormBase";

const profileFormSchema = z.object({
  username: noEmptyStr("Nom d'utilisateur requis"),
  email: z.email("Email invalide"),
  phone: z.union([z.literal(""), phoneSchema("Numéro de téléphone invalide")]),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ProfileFormPayload = {
  username: string;
  email: string;
  phone: string | null;
};

/** @deprecated Use ProfileFormPayload */
export type Schema = ProfileFormPayload;

export const ProfileForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<ProfileFormValues, ProfileFormPayload>) => {
  const form = useForm<ProfileFormValues, unknown, ProfileFormValues>({
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
        onSubmit({
          username: data.username,
          email: data.email,
          phone: emptyToNull(data.phone),
        }),
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
