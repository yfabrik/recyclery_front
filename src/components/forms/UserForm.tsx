import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  USER_ROLES,
} from "../../constants/userRoles";
import type { StoreModel } from "../../interfaces/Models";
import {
  userPayloadFromForm,
  type UserFormPayload,
} from "../../services/mapper/user";
import {
  userFormSchema,
  type UserFormOutput,
  type UserFormValues,
} from "../../services/schema/user";
import {
  FormInput,
  FormMultiSelect,
  FormPasswordInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";

export type { UserFormValues, UserFormOutput, UserFormPayload };
/** @deprecated Use UserFormPayload */
export type Schema = UserFormPayload;

export interface UserFormProps
  extends Omit<
    BaseFormProps<UserFormValues, UserFormPayload>,
    "defaultValues"
  > {
  stores: StoreModel[];
  defaultValues?: (Partial<UserFormValues> & { id?: number }) | null;
}

export const UserForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores,
}: UserFormProps) => {
  const form = useForm<UserFormValues, unknown, UserFormOutput>({
    resolver: zodResolver(userFormSchema),
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
      ...defaultValues,
    },
  });

  const role = form.watch("role");
  useEffect(() => {
    if (role == "employee") form.setValue("managedStores", []);
  }, [role, form]);

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit((data) => onSubmit(userPayloadFromForm(data)))}
    >
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
          <FormInput
            control={form.control}
            label="Prénom"
            name="first_name"
          />
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
            {USER_ROLES.map((roleOption) => (
              <MenuItem key={roleOption.value} value={roleOption.value}>
                {roleOption.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        {role != "employee" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <FormMultiSelect
              control={form.control}
              label="Manager de :"
              name="managedStores"
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
          </Grid>
        )}
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
