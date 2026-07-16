import { zodResolver } from "@hookform/resolvers/zod";
import { Clear } from "@mui/icons-material";
import { Grid, IconButton } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
    PAYMENT_METHOD_FILTER_VALUES,
    TRANSACTION_TYPE_FILTER_VALUES,
} from "../../../interfaces/transactionConstants";
import {
    FormDate,
    FormInput,
    FormPaymentMethodSelect,
    FormTransactionTypeSelect,
} from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";

const filterSchema = z.object({
    date_from: z.coerce
        .date()
        .transform((val) => val.toISOString().slice(0, 10)),
    date_to: z.coerce.date().transform((val) => val.toISOString().slice(0, 10)),
    transaction_number: z.string().trim().optional(),
    transactionType: z.enum(TRANSACTION_TYPE_FILTER_VALUES).optional(),
    transactionMethod: z.enum(PAYMENT_METHOD_FILTER_VALUES).optional(),
});
export type Filters = z.infer<typeof filterSchema>;

interface FilterFormProps {
    defaultValues: Filters;
    onChange: (values: Filters) => void;
}

export const SaleHistoryFilter = ({ defaultValues, onChange }: FilterFormProps) => {

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
