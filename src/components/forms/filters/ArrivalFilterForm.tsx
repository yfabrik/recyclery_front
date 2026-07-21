import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormDate, FormSelect } from "../FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import { useQuery } from "@tanstack/react-query";
import { fetchCollectionPoints } from "../../../services/api/collectionPoint";
import { ARRIVAL_SOURCE_TYPES } from "../../../constants/arrivalSourceTypes";
import { useSyncFilterDefaults } from "../../../hooks/useSyncFilterDefaults";
import {
    arrivalFilterSchema,
    getArrivalFilterDefaults,
    type ArrivalFilters as Filters,
} from "../../../services/schema/arrival";

interface FilterFormProps {
    defaultValues: Filters;
    onChange: (values: Filters) => void;
}

export const ArrivalFilterForm = ({ defaultValues, onChange }: FilterFormProps) => {

    const filters = useForm({
        defaultValues,
        resolver: zodResolver(arrivalFilterSchema),
    });
    const markEmitted = useSyncFilterDefaults(filters, defaultValues);

    const onSubmit = (data: Filters) => {
        markEmitted(data);
        onChange(data);
    };
    const collectionPoints = useQuery({
        queryKey: ["collectionPoints"],
        queryFn: () => fetchCollectionPoints().then((response) => response.data.data),
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
        const subscription = watch(() => {
            debouncer.maybeExecute()
        })
        return () => {
            debouncer.cancel()
            subscription.unsubscribe()
        }
    }, [watch]) // watch all changes

    const handleReset = () => {
        const defaults = getArrivalFilterDefaults();
        filters.reset(defaults);
        markEmitted(defaults);
        onChange(defaults);
    };

    return (
        <form onSubmit={filters.handleSubmit(onSubmit)}>
            <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
                    <FormSelect control={filters.control} name="source_type" label="Type de provenance">
                        <MenuItem key="all-stores" value="">
                            Tous les types
                        </MenuItem>
                        {ARRIVAL_SOURCE_TYPES.map(s => (
                            <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                    </FormSelect>
                </Grid>
                {sourceType === "point" && (
                    <Grid size={{ xs: 12, md: 3 }}>

                        <FormSelect control={filters.control} name="collection_point_id" label="Point de collecte">
                            <MenuItem key="all-points" value="">Tous les points de collecte</MenuItem>
                            {collectionPoints.data?.map((point) => (
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

                <Grid size="auto" sx={{ ml: "auto" }}>
                    <ResetFiltersButton onReset={handleReset} />
                </Grid>
            </Grid>
        </form>
    );
};
