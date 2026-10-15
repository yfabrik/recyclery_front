import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "@mui/icons-material";
import { Grid, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormInput, FormSelect } from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import type { StoreModel } from "../../../interfaces/Models";
import { useSyncFilterDefaults } from "../../../hooks/useSyncFilterDefaults";
import {
  EMPLOYEE_FILTER_FORM_DEFAULTS,
  employeeFilterFormSchema,
  type EmployeeFilterFormValues,
} from "../../../services/schema/employee";

interface EmployeeFilterFormProps {
  defaultValues?: EmployeeFilterFormValues;
  onChange: (values: EmployeeFilterFormValues) => void;
  stores?: StoreModel[];
}

export const EmployeeFilterForm = ({
  defaultValues = EMPLOYEE_FILTER_FORM_DEFAULTS,
  onChange,
  stores = [],
}: EmployeeFilterFormProps) => {
  const form = useForm({
    defaultValues,
    resolver: zodResolver(employeeFilterFormSchema),
  });
  const markEmitted = useSyncFilterDefaults(form, defaultValues);

  const onSubmit = (data: EmployeeFilterFormValues) => {
    markEmitted(data);
    onChange(data);
  };

  const debouncer = useDebouncer(() => {
    form.handleSubmit(onSubmit, (e) => console.error(e))()
  }, { wait: 1000 })
  useEffect(() => {
    const subscription = form.watch(() => {
      debouncer.maybeExecute()
    }) as { unsubscribe: () => void }
    return () => {
      debouncer.cancel()
      subscription.unsubscribe()
    }
  }, [form, debouncer]) // watch all changes

  const handleReset = () => {
    form.reset(EMPLOYEE_FILTER_FORM_DEFAULTS);
    markEmitted(EMPLOYEE_FILTER_FORM_DEFAULTS);
    onChange(EMPLOYEE_FILTER_FORM_DEFAULTS);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 4 }}>
          <FormInput
            control={form.control}
            name="search"
            label=""
            extra={{
              placeholder: "Rechercher un employé...",
              slotProps: {
                input: {
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                },
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={form.control} name="status" label="Statut">
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="active">Actif</MenuItem>
            <MenuItem value="inactive">Inactif</MenuItem>
          </FormSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={form.control} name="store_id" label="Magasin">
            <MenuItem key="all" value="">
              Tous les magasins
            </MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        <Grid size="auto" sx={{ ml: "auto" }}>
          <ResetFiltersButton onReset={handleReset} />
        </Grid>
      </Grid>
    </form>
  );
};
