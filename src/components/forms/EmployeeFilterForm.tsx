import { zodResolver } from "@hookform/resolvers/zod";
import { Refresh, Search } from "@mui/icons-material";
import { Button, Grid, MenuItem } from "@mui/material";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormInput, FormSelect } from "./FormBase";
import { useDebouncer } from "@tanstack/react-pacer";

const filterSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});
export type EmployeeFilters = z.infer<typeof filterSchema>;

const defaultFilterValues: EmployeeFilters = {
  search: "",
  role: "",
  status: "",
};

export const EMPLOYEE_FILTER_DEFAULTS = defaultFilterValues;

interface RoleOption {
  value: string;
  label: string;
}

interface EmployeeFilterFormProps {
  defaultValues?: EmployeeFilters;
  onChange: (values: EmployeeFilters) => void;
  roleOptions: RoleOption[];
}

export const EmployeeFilterForm = ({
  defaultValues = defaultFilterValues,
  onChange,
  roleOptions,
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
    console.log("debouncing")
    form.handleSubmit(onSubmit, (e) => console.error(e))()
  }, { wait: 1000 })
  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      console.log(values, name, type)
      debouncer.maybeExecute()
    })
    return () => {
      debouncer.cancel()
      subscription.unsubscribe()
    }
  }, [watch]) // watch all changes
  // const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // useEffect(() => {
  //   const subscription = form.watch(() => {
  //     if (debounceTimeout.current) {
  //       clearTimeout(debounceTimeout.current);
  //     }
  //     debounceTimeout.current = setTimeout(() => {
  //       form.handleSubmit(onSubmit)();
  //     }, 500);
  //   });

  //   return () => {
  //     subscription.unsubscribe();
  //     if (debounceTimeout.current) {
  //       clearTimeout(debounceTimeout.current);
  //     }
  //   };
  // }, [form]);

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
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={form.control} name="status" label="Statut">
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="active">Actif</MenuItem>
            <MenuItem value="inactive">Inactif</MenuItem>
          </FormSelect>
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            type="button"
            onClick={() => {
              form.reset(defaultFilterValues);
              onChange(defaultFilterValues);
            }}
            fullWidth
          >
            Reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
