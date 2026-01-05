import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormInput, FormSwitch, type BaseFormProps } from "./FormBase";

import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

const schema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  contact_email: z.union([z.email(), z.literal("")]),
  contact_phone: z.union([
    z.string().regex(/^(0|(\+[0-9]{2}[. -]?))[1-9]([. -]?[0-9][0-9]){4}$/),
    z.literal(""),
  ]),
  address: z.string(),
  website: z.string(),
  is_active: z.boolean(),
});

type Schema = z.infer<typeof schema>;

export const EcoOrganismForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<Schema>) => {
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

      ...(defaultValues ?? {}),
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
