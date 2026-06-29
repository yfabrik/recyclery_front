import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  FormInput,
  FormMultiSelect,
  FormPasswordInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";
import { idSchema, phoneSchema } from "../../interfaces/ZodTypes";
import type { StoreModel } from "../../interfaces/Models";
import { emptyStringToNull } from "../../services/zodTransform";
import { useEffect } from "react";
import {
  USER_ROLE_VALUES,
  USER_ROLES,
} from "../../constants/userRoles";

const schema = z.object({
  username: z.string().trim().nonempty("username requis"),
  email: z.email("email requis"),
  first_name: z
    .string()
    .trim()
    .transform((val) => (val == "" ? null : val)),
  last_name: z
    .string()
    .trim()
    .transform((val) => (val == "" ? null : val)),
  phone: z.union([phoneSchema(), z.literal("").transform(() => null)]),
  password: z.string(),
  role: z.enum(USER_ROLE_VALUES, "role requis"),
  recyclery_id: z.union([idSchema(), z.literal("").transform(() => null)]),
  isActive: z.boolean().default(true),
  managedStores: z.array(idSchema())
});

export type Schema = z.infer<typeof schema>;

export interface UserFormProps extends BaseFormProps<Schema> {
  stores: StoreModel[];
}

export const UserForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores,
}: UserFormProps) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "employee",
      recyclery_id: "",
      isActive: true,
      managedStores: [],
      ...data
    },
  });

  const role = form.watch("role")
  useEffect(() => { if (role == "employee") form.setValue("managedStores", []) }, [role])

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            label="Nom d'utilisateur"
            name="username"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput control={form.control} label="Email" name="email" />
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
            <FormPasswordInput
              control={form.control}
              label="Mot de passe"
              name="password"
            />
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect control={form.control} label="Rôle" name="role">
            {USER_ROLES.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        {role != "employee" &&
          <Grid size={{ xs: 12, md: 6 }}>
            <FormMultiSelect
              control={form.control}
              label="Manager de :"
              name="managedStores"
            // renderValue={(selected) => {
            //   return selected.map(item => {
            //     const [type, id] = item.split(".");
            //     return stores.find(store => store.id === +id)?.name;
            //   }).join(", ");

            // }}
            >
              <MenuItem key="no-store" value="">
                Aucun magasin assigné
              </MenuItem>
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}

            </FormMultiSelect>
            {/* <FormSelect
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
          </FormSelect> */}
          </Grid>
        }
        <Grid size={{ xs: 12 }}>
          <FormSwitch
            control={form.control}
            label="Utilisateur actif"
            name="isActive"
          />
        </Grid>
      </Grid>
    </form>
  );
};
