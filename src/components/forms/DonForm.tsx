import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { phoneSchema } from "../../interfaces/ZodTypes";

const schema = z.object({
  donor_name: z.string().nonempty(),
  donor_contact: z.union([z.email(), phoneSchema, z.literal("")]),
  item_description: z.string().nonempty(),
  estimated_value: z.coerce.number().min(0),
  status: z.string(),
});

type Schema = z.infer<typeof schema>;

export const DonForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<Schema>) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      donor_name: "",
      donor_contact: "",
      item_description: "",
      estimated_value: "",
      status: "pending",
      ...(defaultValues ?? {}),
    },
  });

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Nom du Bénéficiaire"
            name="donor_name"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Contact (email/téléphone)"
            name="donor_contact"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Description du Don"
            name="item_description"
            extra={{ multiline: true, rows: 3, required: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Valeur Estimée (€)"
            name="estimated_value"
            extra={{ type: "number" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} label="Statut" name="status">
            <MenuItem value="pending">En Attente</MenuItem>
            <MenuItem value="accepted">Accepté</MenuItem>
            <MenuItem value="rejected">Refusé</MenuItem>
          </FormSelect>
        </Grid>
      </Grid>
    </form>
  );
};
