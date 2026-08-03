import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import type { StoreModel } from "../../interfaces/Models";
import {
  employeeFormSchema,
  type EmployeeFormOutput,
  type EmployeeFormValues,
} from "../../services/schema/employee";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";

export type { EmployeeFormOutput, EmployeeFormValues };

export const EmployeeForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores,
}: BaseFormProps<EmployeeFormValues,EmployeeFormOutput> & {
  stores: StoreModel[];
}) => {
  const form = useForm<EmployeeFormValues, unknown, EmployeeFormOutput>({
    defaultValues: {
      prenom: "",
      nom: "",
      phone: "",
      isActive: true,
      recyclery_id: "",
      ...defaultValues ?? {},
    },
    resolver: zodResolver(employeeFormSchema),
  });

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput name="prenom" control={form.control} label="Prénom" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput name="nom" control={form.control} label="Nom" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput name="phone" control={form.control} label="Téléphone" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            name="recyclery_id"
            label="Magasin"
            control={form.control}
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
            name="isActive"
            control={form.control}
            label="employée actif"
          />
        </Grid>
      </Grid>
    </form>
  );
};
