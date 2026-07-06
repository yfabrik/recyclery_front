import z from "zod";
import type { EcoOrganismQuarterStatsResponse } from "../../services/api/ecoOrganism";
import type { EcoOrganismStatsRow } from "../admin/EcoOrganismStatsTable";
import { idSchema } from "../../interfaces/ZodTypes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  useEffect, useMemo } from "react";
import { useDebouncer } from "@tanstack/react-pacer";
import { useQuery } from "@tanstack/react-query";
import { Grid, MenuItem } from "@mui/material";
import { FormDate, FormSelect } from "./FormBase";
import { ResetFiltersButton } from "./ResetFiltersButton";
import { fetchCollectionPoints } from "../../services/api/collectionPoint";
import { ARRIVAL_SOURCE_TYPES } from "../../constants/arrivalSourceTypes";

const filterSchema = z.object({
  eco_organism_id: z.union([idSchema(), z.literal("")]),
  metric_source: z.enum(["quarterIn", "quarterOut", "quarterSell"]),
  quarter: z.string(),
  month_year: z.date().nullable(),
  source_type: z.string(),
  collection_point_id: z.union([idSchema(), z.literal("")]),
  category: z.string(),
});

export type Filters = z.infer<typeof filterSchema>;

const getDefaultFilters = (): Filters => {
  return {
    eco_organism_id: "",
    metric_source: "quarterOut",
    quarter: "",
    month_year: null,
    source_type: "",
    collection_point_id: "",
    category: "",
  };
};

const parseQuarterKey = (value?: string) => {
  if (!value) return null;
  const match = value.match(/Q([1-4])\s*(\d{4})/i);
  if (!match) return null;
  return { quarterNumber: Number(match[1]), year: Number(match[2]) };
};

const sortQuarterDesc = (a: string, b: string) => {
  const aKey = parseQuarterKey(a);
  const bKey = parseQuarterKey(b);
  if (!aKey || !bKey) return b.localeCompare(a);
  if (aKey.year !== bKey.year) return bKey.year - aKey.year;
  return bKey.quarterNumber - aKey.quarterNumber;
};


interface EcoOrgoStatsFiltersProps {
  defaultValues: Filters;
  onChange: (values: Filters) => void;
  statsRows: EcoOrganismQuarterStatsResponse
  allRows: EcoOrganismStatsRow[]
}
export const EcoOrgStatsFilters = ({ statsRows, allRows, defaultValues, onChange }: EcoOrgoStatsFiltersProps) => {

  const form = useForm<
    Omit<Filters, "eco_organism_id" | "collection_point_id"> & {
      eco_organism_id: unknown;
      collection_point_id: unknown;
    },
    unknown,
    Filters
  >({
    defaultValues: defaultValues,
    resolver: zodResolver(filterSchema),
  });
  const onSubmit = (values: Filters) => {
    onChange(values)
  };

  const collectionPoints = useQuery({
    queryKey: ["collectionPoints"],
    queryFn: () => fetchCollectionPoints(),
  });

  // const SourceType = ({ control }: { control: typeof form.control }) => {
  //   const metric_source = useWatch({
  //     control: control,
  //     name: "metric_source",
  //   });
  //   const typeArrival = metric_source == "quarterIn"

  //   useEffect(() => {
  //     if (!typeArrival) {
  //       form.setValue("source_type", "");
  //     }
  //   }, [typeArrival]);

  //   if (!typeArrival) return null;

  //   return (
  //     <FormSelect
  //       control={form.control}
  //       name="source_type"
  //       label="Source"
  //     >
  //       <MenuItem value="">Toutes les sources</MenuItem>
  //       <MenuItem value="apport">Apport</MenuItem>
  //       <MenuItem value="point">déchetterie</MenuItem>
  //       <MenuItem value="house_clearance">vide maison</MenuItem>

  //     </FormSelect>
  //   );
  // };

  const ecoOrganismOptions = useMemo(() => {
    return (statsRows || []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      is_active: item.is_active
    }));
  }, [statsRows]);


  const sourceTypeOptions = useMemo(() => {
    return Array.from(
      new Set(allRows.map((row) => row.sourceType).filter(Boolean)),
    ).sort();
  }, [allRows]);

  const quarterOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.quarter))).sort(sortQuarterDesc);
  }, [allRows]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.category).filter(Boolean))).sort();//filter remove null and undefined (and 0 too but tehre is none here)
  }, [allRows]);


  const metric_source = form.watch("metric_source")
  const sourceType = form.watch("source_type")

  useEffect(() => {
    if (metric_source != "quarterIn") {
      form.setValue("source_type", "");
      form.setValue("collection_point_id", "");
    }
  }, [metric_source, form]);

  useEffect(() => {
    if (sourceType !== "point") {
      form.setValue("collection_point_id", "");
    }
  }, [sourceType, form]);


  const watch = form.watch;
  const debouncer = useDebouncer(() => {
    form.handleSubmit(onSubmit, (errors) => console.error(errors))();
  }, { wait: 500 });

  useEffect(() => {
    const subscription = watch(() => {
      debouncer.maybeExecute();
    });
    return () => {
      debouncer.cancel();
      subscription.unsubscribe();
    };
  }, [watch, debouncer]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect
            control={form.control}
            name="eco_organism_id"
            label="Eco-organisme"
          >
            <MenuItem value="">Tous</MenuItem>
            {ecoOrganismOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={form.control} name="metric_source" label="Type de flux">
            <MenuItem value="quarterIn">Entrant</MenuItem>
            <MenuItem value="quarterOut">Sortant</MenuItem>
            <MenuItem value="quarterSell">Vendu</MenuItem>
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <FormSelect control={form.control} name="quarter" label="Trimestre">
            <MenuItem value="">Tous les trimestres</MenuItem>
            {quarterOptions.map((quarter) => (
              <MenuItem key={quarter} value={quarter}>
                {quarter}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <FormDate
            control={form.control}
            name="month_year"
            label="Recherche mois/annee"
            extra={{ views: ["year", "month"], openTo: "month" }}
          />
        </Grid>

        {metric_source == "quarterIn" && (
          <>
            <Grid size={{ xs: 12, md: 2 }}>
              <FormSelect
                control={form.control}
                name="source_type"
                label="Source"
              >
                <MenuItem value="">Toutes les sources</MenuItem>
                {ARRIVAL_SOURCE_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </FormSelect>
            </Grid>
            {sourceType === "point" && (
              <Grid size={{ xs: 12, md: 3 }}>
                <FormSelect control={form.control} name="collection_point_id" label="Point de collecte">
                  <MenuItem key="all-points" value="">Tous les points de collecte</MenuItem>
                  {collectionPoints.data?.data.collection_points.map((point) => (
                    <MenuItem key={`point.${point.id}`} value={point.id}>{point.name}</MenuItem>
                  ))}
                </FormSelect>
              </Grid>
            )}
          </>
        )}
        {/* <Grid size={{ xs: 12, md: 2 }}>
          <SourceType control={form.control} />
        </Grid> */}


        <Grid size={{ xs: 12, md: 2 }}>
          <FormSelect
            control={form.control}
            name="category"
            label="Categorie"
          >
            <MenuItem value="">Toutes les categories</MenuItem>
            {categoryOptions.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size="auto" sx={{ ml: "auto" }}>
          <ResetFiltersButton
            onReset={() => form.reset(getDefaultFilters())}
          />
        </Grid>
      </Grid>
    </form>
  )
}