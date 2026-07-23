import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  type BaseFormProps,
} from "./FormBase";

import { DONATION_STATUSES } from "../../constants/donationStatuses";
import {
  donFormSchema,
  type DonFormOutput,
  type DonFormValues,
} from "../../services/schema/don";

export type { DonFormOutput, DonFormValues };
/** @deprecated Use DonFormOutput */
export type Schema = DonFormOutput;

export const DonForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<DonFormValues,DonFormOutput>) => {
  const form = useForm<DonFormValues,unknown,DonFormOutput>({
    resolver: zodResolver(donFormSchema),
    defaultValues: {
      donor_name: "",
      donor_email: "",
      donor_phone: "",
      item_description: "",
      estimated_value: "",
      weight: "",
      status: "pending",
      ...defaultValues ?? {},
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
            label="Contact (email)"
            name="donor_email"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Contact (téléphone)"
            name="donor_phone"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Description du Don"
            name="item_description"
            extra={{ multiline: true, rows: 3 }}
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
          <FormInput
            control={form.control}
            label="Poids (kg)"
            name="weight"
            extra={{ type: "number" }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} label="Statut" name="status">
            {DONATION_STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
      </Grid>
    </form>
  );
};
