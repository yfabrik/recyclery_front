import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormCategorySelect, FormDate, FormSelect } from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import type { CategoryModel } from "../../../interfaces/Models";
import { DISPOSAL_TYPES } from "../../../constants/disposalTypes";
import { useSyncFilterDefaults } from "../../../hooks/useSyncFilterDefaults";
import {
    getWasteFilterFormDefaults,
    wasteFilterFormSchema,
    type WasteFilterFormValues as Filters,
} from "../../../services/schema/waste";

interface WasteFilterFormProps {
    categories: CategoryModel[]
    defaultValues: Filters;
    onChange: (values: Filters) => void;
}
export const WasteFilterForm = ({ categories, defaultValues, onChange }: WasteFilterFormProps) => {
    const form = useForm({
        defaultValues,
        resolver: zodResolver(wasteFilterFormSchema),
    });
    const markEmitted = useSyncFilterDefaults(form, defaultValues);

    const onSubmit = (data: Filters) => {
        markEmitted(data);
        onChange(data);
    };

    const watch = form.watch
    const debouncer = useDebouncer(() => {
        form.handleSubmit(onSubmit, (e) => console.error(e))()
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

    const handleReset = () => {
        const defaults = getWasteFilterFormDefaults();
        form.reset(defaults);
        markEmitted(defaults);
        onChange(defaults);
    };

    return (

        <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormCategorySelect
                    control={form.control}
                    name="category_id"
                    label="Catégorie"
                    categories={categories}
                    emptyOption={{ value: "", label: "Toutes" }}
                    extra={{ size: "small" }}
                />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormSelect control={form.control} name="disposal_type" label="Type" extra={{ size: "small" }}>
                    <MenuItem value="">Tous</MenuItem>
                    {DISPOSAL_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                </FormSelect>

            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormDate control={form.control} name="date_from" label="Date début" extra={{ slotProps: { textField: { size: "small" } } }} />

            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormDate control={form.control} name="date_to" label="Date fin" extra={{ slotProps: { textField: { size: "small" } } }} />
            </Grid>

            <Grid size="auto" sx={{ ml: "auto" }}>
                <ResetFiltersButton onReset={handleReset} />
            </Grid>
        </Grid>
    )
}
