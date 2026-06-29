import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { FormDate, FormSelect } from "./FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import { useQuery } from "@tanstack/react-query";
import { fetchCollectionPoints } from "../../services/api/collectionPoint";
import { idSchema } from "../../interfaces/ZodTypes";

const filterSchema = z.object({
    date_from: z.coerce.date(),
    date_to: z.coerce.date(),
    source_type: z.union([z.enum(["point", "apport", "house_clearance"]), z.literal("")]),
    collection_point_id: z.union([idSchema(), z.literal("")]),
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
    const collectionPoints = useQuery({
        queryKey: ["collectionPoints"],
        queryFn: () => fetchCollectionPoints(),
    });

    const sourceType = filters.watch("source_type");
    useEffect(() => {
        if (sourceType !== "point") {
            filters.setValue("collection_point_id", "");
        }
    }, [sourceType, filters]);  
    
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
                { sourceType === "point" && (
                    <Grid size={{ xs: 12, md: 3 }}>
                        
                        <FormSelect control={filters.control} name="collection_point_id" label="Point de collecte">
                            <MenuItem key="all-points" value="">Tous les points de collecte</MenuItem>
                            {collectionPoints.data &&collectionPoints.data.data.collection_points.map((point) => (
                                <MenuItem key={`point.${point.id}`} value={point.id}>{point.name}</MenuItem>
                            ))}
                        </FormSelect>
                    </Grid>
                )}

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
                <Grid size="auto" sx={{ ml: "auto" }}>
                    <ResetFiltersButton onReset={() => filters.reset()} />
                </Grid>
            </Grid>
        </form>
    );
};
