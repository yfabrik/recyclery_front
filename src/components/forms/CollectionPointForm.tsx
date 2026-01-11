import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface CollectionPointFormProps extends BaseFormProps<Schema> {
  recycleries: Array<{ id: number; name: string }>;
}

const schema = z.object({
  name: z.string().trim().nonempty(),
  address: z.string().trim().nonempty(),
  city: z.string().trim().nonempty(),
  postal_code: z.string().regex(/^(?:0[1-9]|[1-8]\d|9[0-8])\d{3}$/),
  contact_person: z.string().optional().nullable(),
  contact_phone: z.union([
    z.string().regex(/^(0|(\+[0-9]{2}[. -]?))[1-9]([. -]?[0-9][0-9]){4}$/),
    z.literal(""),
  ]),
  contact_email: z.union([z.email(), z.literal("")]),
  // type: z.string(),
  notes: z.string(),
  is_active: z.boolean(),
  recyclery_id: z.coerce.number().nullable().transform(val => val == 0 ? null : val),
});

type Schema = z.infer<typeof schema>;

export const CollectionPointForm = ({
  formId,
  onSubmit,
  defaultValues,
  recycleries,
}: CollectionPointFormProps) => {
  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      postal_code: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      // type: "standard",
      notes: "",
      is_active: true,
      recyclery_id: "",
      ...(defaultValues ?? {}),
    },
    resolver: zodResolver(schema),
  });
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Nom du point" name="name" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {/* <FormSelect control={form.control} label="Type" name="type">
            <MenuItem value="standard">Standard</MenuItem>
            <MenuItem value="enterprise">Entreprise</MenuItem>
            <MenuItem value="association">Association</MenuItem>
            <MenuItem value="school">École</MenuItem>
            <MenuItem value="hospital">Hôpital</MenuItem>
            <MenuItem value="other">Autre</MenuItem>
          </FormSelect> */}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Adresse"
            name="address"
            extra={{ multiline: true, rows: 2 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <FormInput control={form.control} label="Ville" name="city" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormInput
            control={form.control}
            label="Code postal"
            name="postal_code"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            label="Personne de contact"
            name="contact_person"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            label="Téléphone"
            name="contact_phone"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            label="Email"
            name="contact_email"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            control={form.control}
            label="Recyclerie"
            name="recyclery_id"
          >
            <MenuItem value="">Aucune</MenuItem>
            {recycleries.map((recyclery) => (
              <MenuItem key={recyclery.id} value={recyclery.id}>
                {recyclery.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Notes"
            name="notes"
            extra={{ multiline: true, rows: 3 }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormSwitch
            control={form.control}
            label="Point actif"
            name="is_active"
          />
        </Grid>
      </Grid>
    </form>
  );
};
