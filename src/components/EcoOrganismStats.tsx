import { Recycling } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import type { EcoOrganismQuarterStat } from "../services/api/ecoOrganism";

export type { EcoOrganismQuarterStat };

/** Single quarter entry from API */
type QuarterEntry = EcoOrganismQuarterStat["quarters"][number];

export interface EcoOrganismStatsProps {
  /** Stats from fetchEcoOrganismQuarterStats() — one item per eco-organism with id, name, description, quarters */
  stats: EcoOrganismQuarterStat[];
  loading?: boolean;
  /** Label for the metric (e.g. "Poids collecté (kg)") */
  valueLabel?: string;
}

const formatQuarterRange = (quarter: string): string => {
  // If backend already sends a range, keep it
  if (quarter.includes("-")) return quarter;

  const match = quarter.match(/^Q([1-4])\s+(\d{4})$/);
  if (!match) return quarter;

  const q = Number(match[1]);
  const year = Number(match[2]);

  const monthRanges: Record<number, [number, number]> = {
    1: [1, 3],
    2: [4, 6],
    3: [7, 9],
    4: [10, 12],
  };

  const [startMonth, endMonth] = monthRanges[q] ?? [1, 3];

  const pad = (m: number) => (m < 10 ? `0${m}` : `${m}`);

  return `${pad(startMonth)}/${year} - ${pad(endMonth)}/${year}`;
};

const getLastFourQuarterLabels = (): string[] => {
  const now = new Date();
  let y = now.getFullYear();
  let q = Math.floor(now.getMonth() / 3) + 1;
  const labels: string[] = [];
  for (let i = 0; i < 4; i++) {
    labels.push(`Q${q} ${y}`);
    q -= 1;
    if (q === 0) {
      q = 4;
      y -= 1;
    }
  }
  return labels;
};

const defaultQuarters = (): QuarterEntry[] =>
  getLastFourQuarterLabels().map((quarter) => ({
    quarter,
    label: formatQuarterRange(quarter),
    total_weight_kg: 0,
    categories: [],
  }));

export const EcoOrganismStats: React.FC<EcoOrganismStatsProps> = ({
  stats,
  loading = false,
  valueLabel = "Tonnage Sortant (kg)",
}) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [tab, setTab] = useState(0);

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  };

  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Recycling />
          Statistiques par éco-organisme
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!stats?.length) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Recycling />
          Statistiques par éco-organisme
        </Typography>
        <Card>
          <CardContent>
            <Typography color="textSecondary" align="center">
              Aucune donnée disponible
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const currentStat = stats[tab];
  const quarters = currentStat?.quarters?.length ? currentStat.quarters : defaultQuarters();

  const renderQuarterBlocks = (qList: QuarterEntry[]) => (
    <Stack spacing={1.5}>
      {qList.map((q) => (
        <Box
          key={q.quarter}
          sx={{
            p: 1.5,
            bgcolor: "action.hover",
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            {q.quarter?.trim() ? q.quarter : formatQuarterRange(q.quarter)}
          </Typography>

          <Stack spacing={1} sx={{ mt: 1.25 }}>
            {(q.categories ?? []).map((cat) => (
              <Box
                key={cat.id}
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 2,
                  maxWidth: 360,
                  mx: "auto",
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {cat.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {formatValue(cat.weight_kg)} kg
                </Typography>
              </Box>
            ))}

            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 2,
                maxWidth: 360,
                mx: "auto",
                pt: (q.categories?.length ?? 0) > 0 ? 0.75 : 0,
                borderTop: (q.categories?.length ?? 0) > 0 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {formatValue(q.total_weight_kg)} kg
              </Typography>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Recycling />
        Statistiques par éco-organisme
      </Typography>

      {isDesktop ? (
        <Grid container spacing={2}>
          {stats.map((stat) => {
            const orgQuarters = stat.quarters?.length ? stat.quarters : defaultQuarters();
            return (
              <Grid size={{ xs: 12, md: 4 }} key={stat.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                        <Recycling />
                      </Avatar>
                      <Box>
                        <Typography variant="h6">{stat.name}</Typography>
                        {stat.description && (
                          <Typography variant="body2" color="textSecondary">
                            {stat.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {valueLabel} — 4 derniers trimestres
                    </Typography>
                    {renderQuarterBlocks(orgQuarters)}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Card>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider", px: 1 }}
          >
            {stats.map((stat, index) => (
              <Tab key={stat.id} label={stat.name} id={`eco-org-tab-${index}`} />
            ))}
          </Tabs>
          <CardContent>
            {currentStat && (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                    <Recycling />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{currentStat.name}</Typography>
                    {currentStat.description && (
                      <Typography variant="body2" color="textSecondary">
                        {currentStat.description}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {valueLabel} — 4 derniers trimestres
                </Typography>

                {renderQuarterBlocks(quarters)}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EcoOrganismStats;
