import React from "react";
import {
  Alert,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { EcoOrgMetricSource } from "@recyclerie/api/enums";
import { getArrivalSourceLabel } from "../../constants/arrivalSourceTypes";
import { getEcoOrgMetricSourceLabel } from "../../constants/ecoOrgMetricSources";

export interface EcoOrganismStatsRow {
  ecoOrganism: string;
  quarter: string;
  sourceType?: string;
  category: string;
  subcategory?: string;
  weightKg: number;
  quantity?: number;
}

interface EcoOrganismStatsTableProps {
  rows: EcoOrganismStatsRow[];
  loading?: boolean;
  metricSource: EcoOrgMetricSource;
}

//TODO use the one from cartservice ?
const formatWeight = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

const formatQuantity = (value: number) =>
  new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(value);

const getSourceLabel = (value?: string) => {
  if (!value) return "—";
  return getArrivalSourceLabel(value);
};

const getCategoryGroupKey = (row: EcoOrganismStatsRow, metricSource: EcoOrgMetricSource) =>
  [
    row.ecoOrganism,
    row.quarter,
    metricSource === "quarterIn" ? row.sourceType || "—" : "",
    row.category,
  ].join("::");

export const EcoOrganismStatsTable: React.FC<EcoOrganismStatsTableProps> = ({
  rows,
  loading = false,
  metricSource,
}) => {
  const totalWeight = rows.reduce((sum, row) => sum + row.weightKg, 0);
  const totalQuantity = rows.reduce((sum, row) => sum + (row.quantity ?? 0), 0);

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography color="text.secondary">Chargement des statistiques...</Typography>
      </Paper>
    );
  }

  if (rows.length === 0) {
    return (
      <Alert severity="info">
        Aucune donnée à afficher pour les filtres sélectionnés.
      </Alert>
    );
  }

  const categoryTotals = rows.reduce((acc, row) => {
    const key = getCategoryGroupKey(row, metricSource);
    const current = acc.get(key) ?? {
      ecoOrganism: row.ecoOrganism,
      quarter: row.quarter,
      sourceType: row.sourceType,
      category: row.category,
      weightKg: 0,
      quantity: 0,
    };
    current.weightKg += row.weightKg;
    current.quantity += row.quantity ?? 0;
    acc.set(key, current);
    return acc;
  }, new Map<string, {
    ecoOrganism: string;
    quarter: string;
    sourceType?: string;
    category: string;
    weightKg: number;
    quantity: number;
  }>());

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          label={`Lignes: ${rows.length}`}
          color="default"
          variant="outlined"
        />
        <Chip
          label={`${getEcoOrgMetricSourceLabel(metricSource)} total: ${formatWeight(totalWeight)} kg`}
          color="primary"
          variant="filled"
        />
        {metricSource === "quarterSell" && (
          <Chip
            label={`Quantité totale: ${formatQuantity(totalQuantity)}`}
            color="secondary"
            variant="outlined"
          />
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Eco-organisme</TableCell>
              <TableCell>Trimestre</TableCell>
              {metricSource === "quarterIn" && <TableCell>Source</TableCell>}
              <TableCell>Catégorie</TableCell>
              <TableCell>Sous-catégorie</TableCell>
              <TableCell align="right">Poids (kg)</TableCell>
              {metricSource === "quarterSell" && (
                <TableCell align="right">Quantité</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => {
              const groupKey = getCategoryGroupKey(row, metricSource);
              const nextRow = rows[index + 1];
              const isLastRowOfGroup = !nextRow || getCategoryGroupKey(nextRow, metricSource) !== groupKey;
              const groupTotal = categoryTotals.get(groupKey);

              return (
                <React.Fragment key={`${groupKey}-detail-${index}`}>
                  <TableRow>
                    <TableCell>{row.ecoOrganism}</TableCell>
                    <TableCell>{row.quarter}</TableCell>
                    {metricSource === "quarterIn" && (
                      <TableCell>{getSourceLabel(row.sourceType)}</TableCell>
                    )}
                    <TableCell>{row.category}</TableCell>
                    <TableCell>{row.subcategory || "—"}</TableCell>
                    <TableCell align="right">{formatWeight(row.weightKg)}</TableCell>
                    {metricSource === "quarterSell" && (
                      <TableCell align="right">
                        {formatQuantity(row.quantity ?? 0)}
                      </TableCell>
                    )}
                  </TableRow>

                  {isLastRowOfGroup && groupTotal && (
                    <TableRow sx={{ backgroundColor: "action.hover" }}>
                      <TableCell>{groupTotal.ecoOrganism}</TableCell>
                      <TableCell>{groupTotal.quarter}</TableCell>
                      {metricSource === "quarterIn" && (
                        <TableCell>{getSourceLabel(groupTotal.sourceType)}</TableCell>
                      )}
                      <TableCell>
                        <Typography fontWeight={700}>{groupTotal.category}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={700}>Total categorie</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700}>
                          {formatWeight(groupTotal.weightKg)}
                        </Typography>
                      </TableCell>
                      {metricSource === "quarterSell" && (
                        <TableCell align="right">
                          <Typography fontWeight={700}>
                            {formatQuantity(groupTotal.quantity)}
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default EcoOrganismStatsTable;
