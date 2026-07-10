import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  type BaseFormProps,
} from "./FormBase";

import * as z from "zod";
import { noEmptyStr, nullString, phoneSchema } from "../../interfaces/ZodTypes";
import {
  DONATION_STATUSES,
  DONATION_STATUS_VALUES,
} from "../../constants/donationStatuses";

const schema = z.object({
  donor_name: noEmptyStr("nom requis"),
  donor_email: z.union([nullString(),z.email()]),
  donor_phone: z.union([nullString(),phoneSchema()]),
  // donor_contact: z.union([z.email(), phoneSchema(), z.literal("").transform(() => null)]),
  item_description: noEmptyStr("description requise"),
  estimated_value: z.coerce.number().min(0),
  weight: z.preprocess(
    (v) => (v === "" ? undefined : v),
    // z.union([
      // z.undefined().refine(() => false, { message: "Poids requis" }),
      z.coerce.number("poids requis").min(0),
    // ])
  ) as z.ZodType<number>,//TODO remake
  status: z.enum(DONATION_STATUS_VALUES),
});

export type Schema = z.infer<typeof schema>;
export type DonFormValues = z.input<typeof schema>;

export const DonForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<DonFormValues,Schema>) => {
  const form = useForm<DonFormValues,unknown,Schema>({
    resolver: zodResolver(schema),
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
