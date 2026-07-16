import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "@mui/icons-material";
import { Grid, MenuItem, Paper } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { CategoryModel } from "../../../interfaces/Models";
import {
  LABELED_ITEM_STATUSES,
} from "../../../constants/labeledItemStatuses";
import { FormCategorySelect, FormDate, FormInput, FormSelect } from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import {
  EMPTY_FILTER_INPUT,
  filterSchema,
  type FilterInput,
  type Filters,
} from "./labelFiltersSchema";

interface FilterFormProps {
    defaultValues: FilterInput;
    onChange: (values: Filters) => void;
    categories: CategoryModel[]
}

export const LabelFiltersForm = ({ defaultValues, onChange, categories }: FilterFormProps) => {

    const filters = useForm<FilterInput, unknown, Filters>({
        defaultValues,
        resolver: zodResolver(filterSchema),
    });
    const onSubmit = (data: Filters) => {
        onChange(data);
    };


    const watch = filters.watch
    const debouncer = useDebouncer(() => {
        filters.handleSubmit(onSubmit, (e) => console.error(e))()
    }, { wait: 1000 })
    useEffect(() => {
        const subscription = watch(() => {
            debouncer.maybeExecute()
        })
        return () => {
            debouncer.cancel()
            subscription.unsubscribe()
        }
    }, [watch]) // watch all changes


    return (
        <form onSubmit={filters.handleSubmit(onSubmit)}>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <FormInput control={filters.control} name="search" label=""
                            extra={{
                                placeholder: "Rechercher par nom, description ou code-barres...",
                                slotProps: {
                                    input: {
                                        startAdornment: (
                                            <Search sx={{ mr: 1, color: "text.secondary" }} />
                                        ),
                                    },
                                }
                            }} />

                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormSelect label="Statut" control={filters.control} name="status">
                            <MenuItem value={""}>Tous</MenuItem>
                            {LABELED_ITEM_STATUSES.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </FormSelect>

                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormCategorySelect
                            control={filters.control}
                            name="category_id"
                            label="Catégorie"
                            categories={categories}
                            emptyOption={{ value: "", label: "Toutes" }}
                            filterCategories={(cat) => !cat.parent_id}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormDate
                            control={filters.control}
                            name="date_from"
                            label="Date de début"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormDate
                            control={filters.control}
                            name="date_to"
                            label="Date de fin"
                        />
                    </Grid>
                    <Grid size="auto" sx={{ ml: "auto" }}>
                        <ResetFiltersButton
                            onReset={() => {
                                filters.reset(EMPTY_FILTER_INPUT);
                                filters.handleSubmit(onSubmit)();
                            }}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </form>
    );
};
