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
import { idSchema, noEmptyStr, nullString, phoneSchema, postalSchema } from "../../interfaces/ZodTypes";
import type { UserModel } from "../../interfaces/Models";

const schema = z.object({
  name: noEmptyStr("nom requis"),
  manager_id: z.union([nullString(),idSchema(), ]),
  address: z.string().transform(v=>v==""?null:v),
  city: z.string().transform(v=>v==""?null:v),
  postal_code: z.union([nullString(),postalSchema()]),
  phone: z.union([nullString(),phoneSchema()]),
  email: z.union([nullString(),z.email()]),
  is_active: z.boolean(),
});

export type Schema = z.infer<typeof schema>;
export type StoreFormValues = z.input<typeof schema>;
export const StoreForm = ({
  formId,
  onSubmit,
  managers,
  defaultValues,
}: BaseFormProps<StoreFormValues,Schema> & {
  managers: UserModel[];
}) => {
  const form = useForm<StoreFormValues,unknown,Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      manager_id: "",
      address: "",
      city: "",
      postal_code: "",
      phone: "",
      email: "",
      is_active: true,
      ...defaultValues ?? {},
    },
  });

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            label="Nom du magasin"
            control={form.control}
            name="name"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect control={form.control} label="Manager" name="manager_id">
            <MenuItem value="">Aucun</MenuItem>
            {managers.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.username} ({user.role})
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput label="Adresse" name="address" control={form.control} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Ville" name="city" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            label="Code postal"
            name="postal_code"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Téléphone" name="phone" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Email" name="email" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormSwitch
            control={form.control}
            label="Active ?"
            name="is_active"
          />
        </Grid>
      </Grid>
    </form>
  );
};
