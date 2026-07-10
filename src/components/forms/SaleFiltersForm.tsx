import { zodResolver } from "@hookform/resolvers/zod";
import { Clear } from "@mui/icons-material";
import { Grid, IconButton, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { StoreModel } from "../../interfaces/Models";
import { idSchema } from "../../interfaces/ZodTypes";
import { FormDate, FormInput, FormSelect } from "./FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";

const filterSchema = z.object({
    store_id: z.union([idSchema(), z.literal("")]),
    period: z.enum(["week", "month", "custom"]),
    date_from: z.coerce
        .date()
        .transform((val) => val.toISOString().slice(0, 10)),
    date_to: z.coerce.date().transform((val) => val.toISOString().slice(0, 10)),
    transaction_number: z.string().trim().optional(),
});
export type Filters = z.infer<typeof filterSchema>;
export type FiltersInput = z.input<typeof filterSchema>;


interface FilterFormProps {
    stores: StoreModel[];
    defaultValues: Filters;
    onChange: (values: Filters) => void;
}

export const SaleFiltersForm = ({ stores, defaultValues, onChange }: FilterFormProps) => {

    const filters = useForm({
        defaultValues,
        resolver: zodResolver(filterSchema),
    });
    const onSubmit = (data: Filters) => {
        onChange(data);
    };

    const period = filters.watch("period");

    useEffect(() => {
        const today = new Date();

        if (period === "week") {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1);
            const date_from = startOfWeek.toISOString().split("T")[0];
            const date_to = today.toISOString().split("T")[0];

            filters.setValue("date_from", date_from as unknown as Filters["date_from"]);
            filters.setValue("date_to", date_to as unknown as Filters["date_to"]);
        } else if (period === "month") {
            const date_from = new Date(today.getFullYear(), today.getMonth(), 1)
                .toISOString()
                .split("T")[0];
            const date_to = today.toISOString().split("T")[0];

            filters.setValue("date_from", date_from as unknown as Filters["date_from"]);
            filters.setValue("date_to", date_to as unknown as Filters["date_to"]);
        }
    }, [period, filters]);

    const watch = filters.watch
    const debouncer = useDebouncer(() => {
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

    // const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // useEffect(() => {
    //     const subscription = filters.watch(() => {
    //         if (debounceTimeout.current) {
    //             clearTimeout(debounceTimeout.current);
    //         }

    //         debounceTimeout.current = setTimeout(() => {
    //             filters.handleSubmit(onSubmit)();
    //         }, 500);
    //     });

    //     return () => {
    //         subscription.unsubscribe();
    //         if (debounceTimeout.current) {
    //             clearTimeout(debounceTimeout.current);
    //         }
    //     };
    // }, [filters]);

    return (
        <form onSubmit={filters.handleSubmit(onSubmit)}>
            <Grid container spacing={2} alignItems="center">
                {/* Filtre par magasin */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormSelect control={filters.control} name="store_id" label="Magasin">
                        <MenuItem key="all-stores" value="">
                            Tous les magasins
                        </MenuItem>
                        {stores.map((store) => (
                            <MenuItem key={store.id} value={store.id}>
                                {store.name}
                            </MenuItem>
                        ))}
                    </FormSelect>
                </Grid>

                {/* Filtre par période */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormSelect control={filters.control} name="period" label="Période">
                        <MenuItem key="week" value="week">
                            Cette semaine
                        </MenuItem>
                        <MenuItem key="month" value="month">
                            Ce mois
                        </MenuItem>
                        <MenuItem key="custom" value="custom">
                            Personnalisée
                        </MenuItem>
                    </FormSelect>
                </Grid>

                {/* Dates personnalisées */}
                {period === "custom" && (
                    <>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormDate
                                control={filters.control}
                                label="Date de début"
                                name="date_from"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <FormDate
                                control={filters.control}
                                label="Date de fin"
                                name="date_to"
                            />
                        </Grid>
                    </>
                )}

                {/* Recherche par numéro de transaction */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormInput
                        control={filters.control}
                        name="transaction_number"
                        label="N° de transaction"
                        extra={{
                            placeholder: "Ex: 20231215-001",
                            slotProps: {
                                input: {
                                    endAdornment: (
                                        <IconButton
                                            size="small"
                                            onClick={() => filters.resetField("transaction_number")}
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

                {/* Bouton pour effacer tous les filtres */}
                <Grid size="auto" sx={{ ml: "auto" }}>
                    <ResetFiltersButton onReset={() => filters.reset()} />
                </Grid>
            </Grid>
        </form>
    );
};
