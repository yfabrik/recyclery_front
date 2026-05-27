import { zodResolver } from "@hookform/resolvers/zod";
import { FilterList, Search } from "@mui/icons-material";
import { Button, Grid, MenuItem, Paper, type ChipProps } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { CategoryModel, LabeledItemModel } from "../../interfaces/Models";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
import { FormInput, FormSelect } from "./FormBase";

const filterSchema = z.object({
    category_id: z.union([idSchema(), nullString()]),
    search: z.string().trim().optional(),
    status: z.enum(["available", "sold", "reserved",""]),

});
export type Filters = z.infer<typeof filterSchema>;

interface FilterFormProps {
    defaultValues: Filters;
    onChange: (values: Filters) => void;
    statusOptions: {
        value: LabeledItemModel["status"];
        label: string;
        color: NonNullable<ChipProps["color"]>;
    }[]
    categories: CategoryModel[]
}

export const LabelFiltersForm = ({ defaultValues, onChange, statusOptions, categories }: FilterFormProps) => {

    const filters = useForm({
        defaultValues,
        resolver: zodResolver(filterSchema),
    });
    const onSubmit = (data: Filters) => {
        onChange(data);
        console.log("data");
    };


    const watch = filters.watch
    const debouncer = useDebouncer(() => {
        console.log("debouncing")
        filters.handleSubmit(onSubmit, (e) => console.error(e))()
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
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormSelect label="Statut" control={filters.control} name="status">
                            <MenuItem value={""}>Tous</MenuItem>
                            {statusOptions.map((status) => (
                                <MenuItem key={status.value} value={status.value}>
                                    {status.label}
                                </MenuItem>
                            ))}
                        </FormSelect>

                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormSelect control={filters.control} name="category_id" label="Catégorie">
                            <MenuItem value={""}>Toutes</MenuItem>
                            {categories
                                .filter((cat) => !cat.parent_id)
                                .map((category) => (
                                    <MenuItem key={category.id} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                        </FormSelect>

                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={() => filters.reset()

                            }
                        >
                            Réinitialiser
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </form>
    );
};
