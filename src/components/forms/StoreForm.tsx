import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";
import { zodResolver } from "@hookform/resolvers/zod";

import type { UserModel } from "../../interfaces/Models";
import {
  storeFormSchema,
  type StoreFormOutput,
  type StoreFormValues,
} from "../../services/schema/store";

export type { StoreFormOutput, StoreFormValues };
/** @deprecated Use StoreFormOutput */
export type Schema = StoreFormOutput;

export const StoreForm = ({
  formId,
  onSubmit,
  managers,
  defaultValues,
}: BaseFormProps<StoreFormValues, StoreFormOutput> & {
  managers: UserModel[];
}) => {
  const isManagerValid = defaultValues?.manager_id != "" && managers.some(user => user.id == defaultValues?.manager_id);
  const form = useForm<StoreFormValues, unknown, StoreFormOutput>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      postal_code: "",
      phone: "",
      email: "",
      is_active: true,
      ...defaultValues ?? {},
      ...({ manager_id: isManagerValid ? defaultValues?.manager_id : "" })
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
