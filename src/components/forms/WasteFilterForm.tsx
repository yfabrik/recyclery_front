import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z, { literal } from "zod";
import { FormCategorySelect, FormDate, FormSelect } from "./FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import { idSchema } from "../../interfaces/ZodTypes";
import type { CategoryModel } from "../../interfaces/Models";
import {
  DISPOSAL_TYPE_FILTER_VALUES,
  FORM_DISPOSAL_TYPES,
} from "../../constants/disposalTypes";

const filterSchema = z.object({
    category_id: z.union([idSchema(), literal("")]),
    disposal_type: z.enum(DISPOSAL_TYPE_FILTER_VALUES),
    date_from: z.coerce.date(),
    date_to: z.coerce.date()
})

export type Filters = z.infer<typeof filterSchema>

interface WasteFilterFormProps {
    categories: CategoryModel[]
    defaultValues: Filters;
    onChange: (values: Filters) => void;
}
export const WasteFilterForm = ({ categories, defaultValues, onChange }: WasteFilterFormProps) => {
    const form = useForm({
        defaultValues,
        resolver: zodResolver(filterSchema),
    });
    const onSubmit = (data: Filters) => {
        onChange(data);
        console.log("data");
    };


    const watch = form.watch
    const debouncer = useDebouncer(() => {
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
                    {FORM_DISPOSAL_TYPES.map((type) => (
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
                <ResetFiltersButton onReset={() => form.reset()} />
            </Grid>
        </Grid>
    )
}