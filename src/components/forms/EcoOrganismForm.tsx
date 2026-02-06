import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormInput, FormSwitch, type BaseFormProps } from "./FormBase";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { noEmptyStr, nullString, phoneSchema } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";

const schema = z.object({
  name: noEmptyStr("nom requis"),
  description: z.string().transform(v => v == '' ? null : v),
  contact_email: z.union([z.email(), nullString()]),
  contact_phone: z.union([
    phoneSchema(),
    nullString(),
  ]),
  address: z.string().transform(v => v == '' ? null : v),
  website: z.union([
    z.url(),
    nullString()
  ]),
  is_active: z.boolean(),
});

export type Schema = z.infer<typeof schema>;

export const EcoOrganismForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<Schema>) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {}
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      contact_email: "",
      contact_phone: "",
      address: "",
      website: "",
      is_active: true,
      ...data
    },
  });
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <FormInput control={form.control} label="Nom *" name="name" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Description"
            name="description"
            extra={{ multiline: true, rows: 3 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Email de contact"
            name="contact_email"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Téléphone"
            name="contact_phone"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Adresse"
            name="address"
            extra={{ multiline: true, rows: 2 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput control={form.control} label="Site Web" name="website" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormSwitch
            control={form.control}
            label="Éco-organisme actif"
            name="is_active"
          />
        </Grid>
      </Grid>
    </form>
  );
};
