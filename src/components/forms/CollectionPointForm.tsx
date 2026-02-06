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
import { idSchema, noEmptyStr, phoneSchema, postalSchema } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";
import type { StoreModel } from "../../interfaces/Models";

interface CollectionPointFormProps extends BaseFormProps<Schema> {
  recycleries: StoreModel[]
}

const schema = z.object({
  name: noEmptyStr("nom requis"),
  address: noEmptyStr("address requis"),
  city: noEmptyStr("ville requis"),
  postal_code: postalSchema("code postal requis"),
  contact_person: z.string().transform((val) => (val == "" ? null : val)),
  contact_phone: z.union([phoneSchema(), z.literal("").transform(() => null)]),
  contact_email: z.union([z.email(), z.literal("").transform(() => null)]),
  notes: z.string().transform((val) => (val == "" ? null : val)),
  is_active: z.boolean(),
  recyclery_id: z.union([idSchema(), z.literal("").transform(() => null)]),
});

export type Schema = z.infer<typeof schema>;

export const CollectionPointForm = ({
  formId,
  onSubmit,
  defaultValues,
  recycleries,
}: CollectionPointFormProps) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const form = useForm({
    defaultValues: {
      name: "",
      address: "",
      city: "",
      postal_code: "",
      contact_person: "",
      contact_phone: "",
      contact_email: "",
      notes: "",
      is_active: true,
      recyclery_id: "",
      ...data,
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
