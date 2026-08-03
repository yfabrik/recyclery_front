import {
  Box,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { EcoOrganismStatsExport } from "../components/admin/EcoOrganismStatsExport";
import type { EcoOrgMetricSource } from "@recyclerie/api/enums";
import EcoOrganismStatsTable, {
  type EcoOrganismStatsRow,
} from "../components/admin/EcoOrganismStatsTable";
import { EcoOrgStatsFilters } from "../components/forms/filters/EcoOrgStatsFilters";
import {
  ecoOrgFilterSchema,
  getEcoOrgFilterDefaults,
} from "../services/schema/ecoOrganism";
import { useUrlFilters } from "../hooks/useUrlFilters";
import {
  fetchEcoOrganismQuarterStats,
  formatEcoOrgQuarterLabel,
  parseEcoOrgQuarterKey,
  type EcoOrganismQuarterStat,
} from "../services/api/ecoOrganism";


const sortQuarterDesc = (a: string, b: string) => {
  const aKey = parseEcoOrgQuarterKey(a);
  const bKey = parseEcoOrgQuarterKey(b);
  if (!aKey || !bKey) return b.localeCompare(a);
  if (aKey.year !== bKey.year) return bKey.year - aKey.year;
  return bKey.quarterNumber - aKey.quarterNumber;
};

const makeQuarterLabel = (quarter: EcoOrganismQuarterStat["quarters"][number]) =>
  formatEcoOrgQuarterLabel(quarter.quarter);

const monthToQuarterLabel = (date: Date) => {
  const quarterNumber = Math.floor(date.getMonth() / 3) + 1;
  return formatEcoOrgQuarterLabel(`${date.getFullYear()}-T${quarterNumber}` as const);
};

const getMetricRows = (
  stat: EcoOrganismQuarterStat,
  quarter: EcoOrganismQuarterStat["quarters"][number],
  metricSource: EcoOrgMetricSource,
): EcoOrganismStatsRow[] => {
  const rows: EcoOrganismStatsRow[] = [];
  const quarterLabel = makeQuarterLabel(quarter);

  if (metricSource === "quarterIn") {
    const bySourceType = quarter.quarterIn.by_source_type;

    Object.entries(bySourceType).forEach(([sourceType, sourceData]) => {
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
          });//FIXME ça fou la merde la categorie toutes
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
    return rows;
  }

  if (metricSource === "quarterSell") {
    const metric = quarter.quarterSell;
    const categories = metric.categories || [];

    if (categories.length === 0) {
      rows.push({
        ecoOrganism: stat.name,
        quarter: quarterLabel,
        category: "Toutes",
        subcategory: "",
        weightKg: metric.total_weight_kg || 0,
        quantity: 0,
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
          quantity: category.quantity || 0,
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
          quantity: subcategory.quantity || 0,
        });
      });
    });

    return rows;
  }

  const metric = quarter.quarterOut;
  const categories = metric.categories || [];

  if (categories.length === 0) {
    rows.push({
      ecoOrganism: stat.name,
      quarter: quarterLabel,
      category: "Toutes",
      subcategory: "",
      weightKg: metric.total_weight_kg || 0,
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
      });
    });
  });

  return rows;
};

const EcoOrganismStatsPage = () => {
  const defaults = useMemo(() => getEcoOrgFilterDefaults(), []);
  const { filters, setFilters, page, setPage } = useUrlFilters({
    schema: ecoOrgFilterSchema,
    defaults,
    withPage: true,
  });

  const ecoStats = useQuery({
    queryKey: ["ecoOrganismQuarterStats",filters.collection_point_id],
    queryFn: () => fetchEcoOrganismQuarterStats(filters.collection_point_id !=""?{point:filters.collection_point_id}:{}).then((response) => response.data.data),
  });

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

  const quarterPageCount = selectedQuarter
    ? 1
    : Math.max(1, quarterOptions.length);

  const displayedQuarters = useMemo(() => {
    if (selectedQuarter) return [selectedQuarter];
    const quarterAtPage = quarterOptions[page - 1];
    return quarterAtPage ? [quarterAtPage] : [];
  }, [selectedQuarter, quarterOptions, page]);

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

  const filteredRows = useMemo(() => {
    return allRows
      .filter((row) =>
        selectedQuarter === "" ? true : row.quarter === selectedQuarter,
      )
      .filter((row) =>
        filters.metric_source !== "quarterIn" || filters.source_type === ""
          ? true
          : row.sourceType === filters.source_type,
      )
      .filter((row) =>
        filters.category === "" ? true : row.category === filters.category,
      );
  }, [allRows, selectedQuarter, filters.metric_source, filters.source_type, filters.category]);

  // const sourceTypeOptions = useMemo(() => {
  //   return Array.from(
  //     new Set(allRows.map((row) => row.sourceType).filter(Boolean)),
  //   ).sort();
  // }, [allRows]);

  // const categoryOptions = useMemo(() => {
  //   return Array.from(new Set(allRows.map((row) => row.category).filter(Boolean))).sort();
  // }, [allRows]);

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Statistiques Eco-organismes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vue detaillee des flux entrants, sortants et vendus par eco-organisme.
          </Typography>
        </Box>
        <EcoOrganismStatsExport
          filteredRows={filteredRows}
          allRows={allRows}
          metricSource={filters.metric_source}
          disabled={ecoStats.isLoading}
        />
      </Box>

      <Paper sx={{ p: 2 }}>
        <EcoOrgStatsFilters
          defaultValues={filters}
          onChange={setFilters}
          statsRows={ecoStats.data ?? []}
          allRows={allRows}
        />
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
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
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
