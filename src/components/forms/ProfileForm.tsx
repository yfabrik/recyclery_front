import { zodResolver } from "@hookform/resolvers/zod";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { phoneSchema } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";
import { FormInput, type BaseFormProps } from "./FormBase";

const schema = z.object({
  username: z.string().trim().nonempty("Nom d'utilisateur requis"),
  email: z.email("Email invalide"),
  phone: z.union([
    phoneSchema("Numéro de téléphone invalide"),
    z.literal("").transform(() => null),
  ]),
});

export type Schema = z.infer<typeof schema>;

export const ProfileForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<Schema>) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: defaultValues?.username ?? "",
      email: defaultValues?.email ?? "",
      phone: defaultValues?.phone ?? "",
      ...data,
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
