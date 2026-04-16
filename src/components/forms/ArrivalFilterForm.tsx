import { zodResolver } from "@hookform/resolvers/zod";
import { Clear } from "@mui/icons-material";
import { Box, Button, Grid, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormDate, FormSelect } from "./FormBase";

const filterSchema = z.object({
    date_from: z.coerce.date(),
    date_to: z.coerce.date(),
    source_type: z.union([z.enum(["point", "apport", "house_clearance"]), z.literal("")]),
});
export type Filters = z.infer<typeof filterSchema>;

interface FilterFormProps {
    defaultValues: Filters;
    onChange: (values: Filters) => void;
}

export const ArrivalFilterForm = ({ defaultValues, onChange }: FilterFormProps) => {

    const filters = useForm({
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
                {/* Filtre par magasin */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormSelect control={filters.control} name="source_type" label="Type de provenance">
                        <MenuItem key="all-stores" value="">
                            Tous les types
                        </MenuItem>
                        <MenuItem key="point" value="point">
                            Point de collecte
                        </MenuItem>
                        <MenuItem key="apport" value="apport">
                            Apport volontaire
                        </MenuItem>
                        <MenuItem key="house_clearance" value="house_clearance">
                            Vide maison
                        </MenuItem>
                    </FormSelect>
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




                {/* Bouton pour effacer tous les filtres */}
                <Grid size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Clear />}
                            onClick={() => filters.reset()}
                        >
                            Effacer tous les filtres
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </form>
    );
};
