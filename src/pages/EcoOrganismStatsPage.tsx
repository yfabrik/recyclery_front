import { zodResolver } from "@hookform/resolvers/zod";
import { FilterList } from "@mui/icons-material";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useDebouncer } from "@tanstack/react-pacer";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import EcoOrganismStatsTable, {
  type EcoMetricSource,
  type EcoOrganismStatsRow,
} from "../components/admin/EcoOrganismStatsTable";
import { FormDate, FormSelect } from "../components/forms/FormBase";
import { idSchema } from "../interfaces/ZodTypes";
import {
  fetchEcoOrganismQuarterStats,
  type EcoOrganismQuarterStat,
} from "../services/api/ecoOrganism";

const filterSchema = z.object({
  eco_organism_id: z.union([idSchema(), z.literal("")]),
  metric_source: z.enum(["quarterIn", "quarterOut", "quarterSell"]),
  quarter: z.string(),
  month_year: z.date().nullable(),
  source_type: z.string(),
  category: z.string(),
});

type Filters = z.infer<typeof filterSchema>;

const getDefaultFilters = (): Filters => {
  return {
    eco_organism_id: "",
    metric_source: "quarterOut",
    quarter: "",
    month_year: null,
    source_type: "",
    category: "",
  };
};

const parseQuarterKey = (value?: string) => {
  if (!value) return null;
  const match = value.match(/Q([1-4])\s*(\d{4})/i);
  if (!match) return null;
  return { quarterNumber: Number(match[1]), year: Number(match[2]) };
};

const monthToQuarterLabel = (date: Date) => {
  const quarterNumber = Math.floor(date.getMonth() / 3) + 1;
  return `Q${quarterNumber} ${date.getFullYear()}`;
};

const sortQuarterDesc = (a: string, b: string) => {
  const aKey = parseQuarterKey(a);
  const bKey = parseQuarterKey(b);
  if (!aKey || !bKey) return b.localeCompare(a);
  if (aKey.year !== bKey.year) return bKey.year - aKey.year;
  return bKey.quarterNumber - aKey.quarterNumber;
};

const makeQuarterLabel = (quarter: { quarter?: string; label?: string }) =>
  quarter.label || quarter.quarter || "N/A";

const getMetricRows = (
  stat: EcoOrganismQuarterStat,
  quarter: EcoOrganismQuarterStat["quarters"][number],
  metricSource: EcoMetricSource,
): EcoOrganismStatsRow[] => {
  const rows: EcoOrganismStatsRow[] = [];
  const quarterLabel = makeQuarterLabel(quarter);

  if (metricSource === "quarterIn") {
    const bySourceRaw = quarter.quarterIn?.by_source_type;
    const bySourceArray = Array.isArray(bySourceRaw) ? bySourceRaw : [bySourceRaw];

    bySourceArray.forEach((sourceRecord) => {
      if (!sourceRecord) return;
      Object.entries(sourceRecord).forEach(([sourceType, sourceData]) => {
        if (!sourceData) return;
        const categories = sourceData.categories || [];
        if (categories.length === 0) {
          rows.push({
            ecoOrganism: stat.name,
            quarter: quarterLabel,
            sourceType,
            category: "Toutes",
            subcategory: "",
            weightKg: sourceData.total_weight_kg || 0,
          });
          return;
        }

        categories.forEach((category) => {
          const subcategories = category.subcategories || [];
          if (subcategories.length === 0) {
            rows.push({
              ecoOrganism: stat.name,
              quarter: quarterLabel,
              sourceType,
              category: category.name,
              subcategory: "",
              weightKg: category.weight_kg || 0,
            });
            return;
          }

          subcategories.forEach((subcategory) => {
            rows.push({
              ecoOrganism: stat.name,
              quarter: quarterLabel,
              sourceType,
              category: category.name,
              subcategory: subcategory.name,
              weightKg: subcategory.weight_kg || 0,
            });
          });
        });
      });
    });
    return rows;
  }

  const metric = quarter[metricSource];
  const categories = metric?.categories || [];

  if (categories.length === 0) {
    rows.push({
      ecoOrganism: stat.name,
      quarter: quarterLabel,
      category: "Toutes",
      subcategory: "",
      weightKg: metric?.total_weight_kg || 0,
      quantity: metricSource === "quarterSell" ? 0 : undefined,
    });
    return rows;
  }

  categories.forEach((category) => {
    const subcategories = category.subcategories || [];
    if (subcategories.length === 0) {
      rows.push({
        ecoOrganism: stat.name,
        quarter: quarterLabel,
        category: category.name,
        subcategory: "",
        weightKg: category.weight_kg || 0,
        quantity: metricSource === "quarterSell" ? category.quantity || 0 : undefined,
      });
      return;
    }

    subcategories.forEach((subcategory) => {
      rows.push({
        ecoOrganism: stat.name,
        quarter: quarterLabel,
        category: category.name,
        subcategory: subcategory.name,
        weightKg: subcategory.weight_kg || 0,
        quantity: metricSource === "quarterSell" ? subcategory.quantity || 0 : undefined,
      });
    });
  });

  return rows;
};

const EcoOrganismStatsPage = () => {
  const [filters, setFilters] = useState<Filters>(getDefaultFilters);
  const [quarterPage, setQuarterPage] = useState(1);

  const form = useForm<Filters>({
    defaultValues: filters,
    resolver: zodResolver(filterSchema),
  });

  const onSubmit = (values: Filters) => {
    setFilters(values);
  };

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

  const ecoStats = useQuery({
    queryKey: ["ecoOrganismQuarterStats"],
    queryFn: () => fetchEcoOrganismQuarterStats().then((response) => response.data.stats),
  });

  const ecoOrganismOptions = useMemo(() => {
    return (ecoStats.data || []).map((item) => ({
      id: item.id,
      name: item.name,
    }));
  }, [ecoStats.data]);

  const allRows = useMemo(() => {
    return (ecoStats.data || [])
      .filter((item) =>
        filters.eco_organism_id === ""
          ? true
          : item.id === Number(filters.eco_organism_id),
      )
      .flatMap((stat) =>
        stat.quarters.flatMap((quarter) =>
          getMetricRows(stat, quarter, filters.metric_source),
        ),
      );
  }, [ecoStats.data, filters]);

  const quarterOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.quarter))).sort(sortQuarterDesc);
  }, [allRows]);

  const selectedQuarter = useMemo(() => {
    if (filters.quarter) return filters.quarter;
    if (filters.month_year) return monthToQuarterLabel(filters.month_year);
    return "";
  }, [filters]);

  useEffect(() => {
    if (filters.metric_source !== "quarterIn" && filters.source_type !== "") {
      form.setValue("source_type", "");
      setFilters((prev) => ({ ...prev, source_type: "" }));
    }
  }, [filters.metric_source, filters.source_type, form]);

  useEffect(() => {
    setQuarterPage(1);
  }, [filters, ecoStats.data]);

  const quarterPageCount = selectedQuarter
    ? 1
    : Math.max(1, quarterOptions.length);

  const displayedQuarters = useMemo(() => {
    if (selectedQuarter) return [selectedQuarter];
    const quarterAtPage = quarterOptions[quarterPage - 1];
    return quarterAtPage ? [quarterAtPage] : [];
  }, [selectedQuarter, quarterOptions, quarterPage]);

  const rows = useMemo(() => {
    if (displayedQuarters.length === 0) return [];
    const quarterSet = new Set(displayedQuarters);
    return allRows
      .filter((row) => quarterSet.has(row.quarter))
      .filter((row) =>
        filters.metric_source !== "quarterIn" || filters.source_type === ""
          ? true
          : row.sourceType === filters.source_type,
      )
      .filter((row) =>
        filters.category === "" ? true : row.category === filters.category,
      );
  }, [allRows, displayedQuarters, filters.metric_source, filters.source_type, filters.category]);

  const sourceTypeOptions = useMemo(() => {
    return Array.from(
      new Set(allRows.map((row) => row.sourceType).filter(Boolean)),
    ).sort();
  }, [allRows]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set(allRows.map((row) => row.category).filter(Boolean))).sort();
  }, [allRows]);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Statistiques Eco-organismes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vue detaillee des flux entrants, sortants et vendus par eco-organisme.
        </Typography>
      </Box>

      <Paper sx={{ p: 2 }}>
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

            {filters.metric_source === "quarterIn" && (
              <Grid size={{ xs: 12, md: 2 }}>
                <FormSelect
                  control={form.control}
                  name="source_type"
                  label="Source"
                >
                  <MenuItem value="">Toutes les sources</MenuItem>
                  {sourceTypeOptions.map((sourceType) => (
                    <MenuItem key={sourceType} value={sourceType}>
                      {sourceType}
                    </MenuItem>
                  ))}
                </FormSelect>
              </Grid>
            )}

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

            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => form.reset(getDefaultFilters())}
              >
                Reinitialiser
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <EcoOrganismStatsTable
        rows={rows}
        loading={ecoStats.isLoading}
        metricSource={filters.metric_source}
      />
      {!selectedQuarter && quarterOptions.length > 1 && (
        <Stack alignItems="center">
          <Pagination
            color="primary"
            count={quarterPageCount}
            page={quarterPage}
            onChange={(_, page) => setQuarterPage(page)}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Trimestre affiche: {displayedQuarters[0] || "Aucun"}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};

export default EcoOrganismStatsPage;
