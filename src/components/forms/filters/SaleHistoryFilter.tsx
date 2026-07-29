import { zodResolver } from "@hookform/resolvers/zod";
import { Clear } from "@mui/icons-material";
import { Grid, IconButton } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    FormDate,
    FormInput,
    FormPaymentMethodSelect,
    FormTransactionTypeSelect,
} from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import { useSyncFilterDefaults } from "../../../hooks/useSyncFilterDefaults";
import {
    getSaleHistoryFilterDefaults,
    saleHistoryFilterSchema,
    type SaleHistoryFilterInput,
    type SaleHistoryFilters as Filters,
} from "../../../services/schema/sale";

interface FilterFormProps {
    defaultValues: SaleHistoryFilterInput;
    onChange: (values: Filters) => void;
}

export const SaleHistoryFilter = ({ defaultValues, onChange }: FilterFormProps) => {

    // Explicit input/output generics: filterIsoDate uses coerce+transform, so z.input ≠ z.infer.
    // Without this, watch(callback) is typed as returning `never` and .unsubscribe breaks.
    const filters = useForm<SaleHistoryFilterInput, unknown, Filters>({
        defaultValues,
        resolver: zodResolver(saleHistoryFilterSchema),
    });
    const markEmitted = useSyncFilterDefaults(filters, defaultValues);

    const onSubmit = (data: Filters) => {
        markEmitted(filters.getValues());
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

    const handleReset = () => {
        const defaults = getSaleHistoryFilterDefaults();
        filters.reset(defaults);
        markEmitted(defaults);
        onChange(defaults);
    };

    return (
        <form onSubmit={filters.handleSubmit(onSubmit)}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormPaymentMethodSelect
                        control={filters.control}
                        name="transactionMethod"
                        label="payment type"
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormTransactionTypeSelect
                        control={filters.control}
                        name="transactionType"
                        label="transaction type"
                    />
                </Grid>

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
