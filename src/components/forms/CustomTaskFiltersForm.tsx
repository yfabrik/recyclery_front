import { zodResolver } from "@hookform/resolvers/zod";
import { Clear, Refresh, Search } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { StoreModel } from "../../interfaces/Models";
import { PRIORITY_FILTER_VALUES } from "../../constants/taskPriorities";
import { TASK_PRIORITIES } from "../../constants/taskPriorities";
import {
  RECURRENCE_FILTER_VALUES,
  RECURRENCE_PATTERNS,
} from "../../constants/recurrencePatterns";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
import { FormInput, FormSelect } from "./FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";

const filterSchema = z.object({
  search: z.string().trim().optional(),
  store_id: z.union([idSchema(), nullString()]),
  priority: z.enum(PRIORITY_FILTER_VALUES),
  recurrence: z.enum(RECURRENCE_FILTER_VALUES),
});

export type CustomTaskFilters = z.infer<typeof filterSchema>;

export const CUSTOM_TASK_FILTER_DEFAULTS: CustomTaskFilters = {
  search: "",
  store_id: null,
  priority: "all",
  recurrence: "all",
};

interface CustomTaskFiltersFormProps {
  stores: StoreModel[];
  defaultValues: CustomTaskFilters;
  onChange: (values: CustomTaskFilters) => void;
  onRefresh?: () => void;
}

export const CustomTaskFiltersForm = ({
  stores,
  defaultValues,
  onChange,
  onRefresh,
}: CustomTaskFiltersFormProps) => {
  const filters = useForm({
    defaultValues,
    resolver: zodResolver(filterSchema),
  });

  const onSubmit = (data: CustomTaskFilters) => {
    onChange(data);
  };

  const watch = filters.watch;
  const debouncer = useDebouncer(
    () => {
      filters.handleSubmit(onSubmit)();
    },
    { wait: 500 },
  );

  useEffect(() => {
    const subscription = watch(() => {
      debouncer.maybeExecute();
    });
    return () => {
      debouncer.cancel();
      subscription.unsubscribe();
    };
  }, [watch, debouncer]);

  const handleReset = () => {
    filters.reset(CUSTOM_TASK_FILTER_DEFAULTS);
    onChange(CUSTOM_TASK_FILTER_DEFAULTS);
  };

  return (
    <form onSubmit={filters.handleSubmit(onSubmit)}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <FormInput
            control={filters.control}
            name="search"
            label="Rechercher"
            extra={{
              placeholder: "Rechercher une tâche...",
              slotProps: {
                input: {
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => filters.resetField("search")}
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  ),
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={filters.control} name="store_id" label="Magasin">
            <MenuItem value="">Tous les magasins</MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <FormSelect control={filters.control} name="priority" label="Priorité">
            <MenuItem value="all">Toutes les priorités</MenuItem>
            {TASK_PRIORITIES.map((priority) => (
              <MenuItem key={priority.value} value={priority.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {priority.icon}
                  {priority.label}
                </Box>
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <FormSelect
            control={filters.control}
            name="recurrence"
            label="Récurrence"
          >
            <MenuItem value="all">Toutes</MenuItem>
            <MenuItem value="none">Aucune</MenuItem>
            {RECURRENCE_PATTERNS.filter((p) => p.value).map((pattern) => (
              <MenuItem key={pattern.value} value={pattern.value}>
                {pattern.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        {onRefresh && (
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              type="button"
              onClick={onRefresh}
              fullWidth
            >
              Actualiser
            </Button>
          </Grid>
        )}

        <Grid size="auto" sx={{ ml: "auto" }}>
          <ResetFiltersButton onReset={handleReset} />
        </Grid>
      </Grid>
    </form>
  );
};
