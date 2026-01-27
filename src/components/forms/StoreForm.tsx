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
import { idSchema, phoneSchema, postalSchema } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";
import type { UserModel } from "../../interfaces/Models";

const schema = z.object({
  name: z.string().nonempty(),
  manager_id: z.union([idSchema(), z.literal("").transform(() => null)]),
  address: z.string(),
  city: z.string(),
  postal_code: z.union([postalSchema(), z.literal("").transform(() => null)]),
  phone: z.union([phoneSchema(), z.literal("").transform(() => null)]),
  email: z.union([z.email(), z.literal("").transform(() => null)]),
  is_active: z.boolean(),
});

type Schema = z.infer<typeof schema>;

export const StoreForm = ({
  formId,
  onSubmit,
  managers,
  defaultValues,
}: BaseFormProps<Schema> & {
  managers: UserModel[];
}) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const form = useForm({
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
      ...data,
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
