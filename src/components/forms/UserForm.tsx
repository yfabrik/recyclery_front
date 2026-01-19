import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";
import { idSchema, phoneSchema } from "../../interfaces/ZodTypes";
import type { StoreModel } from "../../interfaces/Models";

const schema = z.object({
  username: z.string("username requis"),
  email: z.email("email requis"),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.union([phoneSchema(), z.literal("").transform(v=>null)]),
  password: z.string(),
  role: z.string(),
  recyclery_id: idSchema(),
  is_active: z.boolean().default(true),
});

export type Schema = z.infer<typeof schema>;

export interface UserFormProps extends BaseFormProps<Schema> {
  stores: StoreModel[];
  roles: { name: string; display_name: string }[];
}

export const UserForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores,
  roles,
}: UserFormProps) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "",
      recyclery_id: "",
      is_active: true,
      ...(defaultValues ?? {}),
    },
  });

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            label="Nom d'utilisateur *"
            name="username"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Email *" name="email" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Prénom" name="first_name" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Nom" name="last_name" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Téléphone" name="phone" />
        </Grid>
        {!defaultValues?.id && (
          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              control={form.control}
              label="Mot de passe *"
              name="password"
              extra={{ type: "password" }}
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect control={form.control} label="Rôle *" name="role">
            {roles.map((role) => (
              <MenuItem key={role.name} value={role.name}>
                {role.display_name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            control={form.control}
            label="Magasin"
            name="recyclery_id"
          >
            <MenuItem key="no-store" value="">
              Aucun magasin assigné
            </MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormSwitch
            control={form.control}
            label="Utilisateur actif"
            name="is_active"
          />
        </Grid>
      </Grid>
    </form>
  );
};
