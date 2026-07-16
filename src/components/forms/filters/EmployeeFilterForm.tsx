import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "@mui/icons-material";
import { Grid, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormInput, FormSelect } from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import { idSchema } from "@recyclerie/api/primitives/zod";
import type { StoreModel } from "../../../interfaces/Models";

const filterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  store_id: z.union([idSchema(), z.literal("")]).optional(),
});
export type EmployeeFilters = z.infer<typeof filterSchema>;
export type EmployeeFiltersValues = z.input<typeof filterSchema>;


const defaultFilterValues: EmployeeFiltersValues = {
  search: "",
  status: "",
  store_id: "",
};

export const EMPLOYEE_FILTER_DEFAULTS = defaultFilterValues;

// interface RoleOption {
//   value: string;
//   label: string;
// }

interface EmployeeFilterFormProps {
  defaultValues?: EmployeeFilters;
  onChange: (values: EmployeeFilters) => void;
  // roleOptions: RoleOption[];
  stores?: StoreModel[];
}

export const EmployeeFilterForm = ({
  defaultValues = defaultFilterValues,
  onChange,
  // roleOptions,
  stores=[],
}: EmployeeFilterFormProps) => {
  const form = useForm<EmployeeFilters>({
    defaultValues,
    resolver: zodResolver(filterSchema),
  });

  const onSubmit = (data: EmployeeFilters) => {
    onChange(data);
  };

  const watch = form.watch
  const debouncer = useDebouncer(()=>{
    form.handleSubmit(onSubmit, (e) => console.error(e))()
  }, { wait: 1000 })
  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      // console.log(values, name, type)
      debouncer.maybeExecute()
    })
    return () => {
      debouncer.cancel()
      subscription.unsubscribe()
    }
  }, [watch]) // watch all changes
  
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
        {/* <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect label="Rôle" control={form.control} name="role">
            <MenuItem key="all" value="">
              Tous les rôles
            </MenuItem>
            {roleOptions.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid> */}
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
          <ResetFiltersButton
            onReset={() => {
              form.reset(defaultFilterValues);
              onChange(defaultFilterValues);
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};
