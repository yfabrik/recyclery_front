import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";
import { zodResolver } from "@hookform/resolvers/zod";
import type { StoreModel } from "../../interfaces/Models";
import {
  collectionPointFormSchema,
  type CollectionPointFormOutput,
  type CollectionPointFormValues,
} from "../../services/schema/collectionPoint";

export type { CollectionPointFormOutput, CollectionPointFormValues };
/** @deprecated Use CollectionPointFormOutput */
export type Schema = CollectionPointFormOutput;
/** @deprecated Use CollectionPointFormValues */
export type SchemaInputValues = CollectionPointFormValues;

interface CollectionPointFormProps extends BaseFormProps<CollectionPointFormValues,CollectionPointFormOutput> {
  recycleries: StoreModel[]
}

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
      notes: "",
      is_active: true,
      recyclery_id: "",
      ...defaultValues ?? {},
    },
    resolver: zodResolver(collectionPointFormSchema),
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
