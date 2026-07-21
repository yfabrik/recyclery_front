import { zodResolver } from "@hookform/resolvers/zod";
import { Clear } from "@mui/icons-material";
import { Grid, IconButton, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { StoreModel } from "../../../interfaces/Models";
import { toIsoDate } from "../../../services/dateService";
import { FormDate, FormInput, FormSelect } from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import { useSyncFilterDefaults } from "../../../hooks/useSyncFilterDefaults";
import {
    getSaleFilterDefaults,
    saleFilterSchema,
    type SaleFilters as Filters,
} from "../../../services/schema/sale";

interface FilterFormProps {
    stores: StoreModel[];
    defaultValues: Filters;
    onChange: (values: Filters) => void;
}

export const SaleFiltersForm = ({ stores, defaultValues, onChange }: FilterFormProps) => {

    const filters = useForm({
        defaultValues,
        resolver: zodResolver(saleFilterSchema),
    });
    const markEmitted = useSyncFilterDefaults(filters, defaultValues);

    const onSubmit = (data: Filters) => {
        markEmitted(data);
        onChange(data);
    };

    const period = filters.watch("period");

    useEffect(() => {
        const today = new Date();

        if (period === "week") {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + 1);
            filters.setValue("date_from", toIsoDate(startOfWeek));
            filters.setValue("date_to", toIsoDate(today));
        } else if (period === "month") {
            filters.setValue(
                "date_from",
                toIsoDate(new Date(today.getFullYear(), today.getMonth(), 1)),
            );
            filters.setValue("date_to", toIsoDate(today));
        }
    }, [period, filters]);

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

    const handleReset = () => {
        const defaults = getSaleFilterDefaults();
        filters.reset(defaults);
        markEmitted(defaults);
        onChange(defaults);
    };

    return (
        <form onSubmit={filters.handleSubmit(onSubmit)}>
            <Grid container spacing={2} alignItems="center">
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

                <Grid size="auto" sx={{ ml: "auto" }}>
                    <ResetFiltersButton onReset={handleReset} />
                </Grid>
            </Grid>
        </form>
    );
};
