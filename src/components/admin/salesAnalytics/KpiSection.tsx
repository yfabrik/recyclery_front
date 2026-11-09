import type { SalesKpisDto } from "@recyclerie/api/responses/salesAnalytics";
import { Alert, Box, Grid, Typography } from "@mui/material";
import { salesKpisRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency, formatPercentage } from "../../../services/cartService";
import { computeChange } from "./change";
import { COMPARE_LABELS } from "./filters";
import { EmptyKpiCard, KpiCard } from "./KpiCard";
import { rangeLabel } from "./period";
import type { SalesAnalyticsSectionProps } from "./sections";
import { useSalesAnalytics } from "./useSalesAnalytics";

const count = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
const plural = (n: number, word: string) => `${count.format(n)} ${word}${n > 1 ? "s" : ""}`;

type CardSpec = {
  title: string;
  value: (k: SalesKpisDto) => string;
  subtitle?: (k: SalesKpisDto) => string;
  /** The figure the change is computed on. */
  figure: (k: SalesKpisDto) => number;
  lowerIsBetter?: boolean;
};

/** In display order: 4 per row on wide screens. */
const CARDS: CardSpec[] = [
  {
    title: "CA net",
    value: (k) => formatCurrency(k.net_revenue),
    subtitle: (k) =>
      `Brut ${formatCurrency(k.gross_revenue)} · Remboursé ${formatCurrency(k.refunded_amount)}`,
    figure: (k) => k.net_revenue,
  },
  { title: "Ventes", value: (k) => count.format(k.sales_count), figure: (k) => k.sales_count },
  {
    title: "Panier moyen",
    value: (k) => formatCurrency(k.average_basket),
    figure: (k) => k.average_basket,
  },
  {
    title: "Objets vendus",
    value: (k) => count.format(k.items_sold),
    figure: (k) => k.items_sold,
  },
  {
    title: "CA par jour d'ouverture",
    value: (k) => formatCurrency(k.revenue_per_opening_day),
    subtitle: (k) => plural(k.opening_days, "jour") + " d'ouverture",
    figure: (k) => k.revenue_per_opening_day,
  },
  {
    title: "Remboursements",
    value: (k) => formatCurrency(k.refunded_amount),
    subtitle: (k) =>
      `${plural(k.refund_count, "remboursement")} · ${formatPercentage(
        k.gross_revenue > 0 ? k.refunded_amount / k.gross_revenue : 0,
      )} du brut`,
    figure: (k) => k.refunded_amount,
    lowerIsBetter: true,
  },
];

const CARD_SIZE = { xs: 12, sm: 6, lg: 3 } as const;

/** The KPI cards: net revenue, sales, basket, items, revenue per opening day, refunds. */
export const KpiSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const kpis = useSalesAnalytics(salesKpisRoute, filters);

  if (kpis.isError)
    return <Alert severity="error">Erreur lors du chargement des indicateurs.</Alert>;

  const current = kpis.data?.current;
  const comparison = kpis.data?.comparison ?? null;
  const comparisonRange = kpis.data?.ranges.comparison;
  const isEmpty = current && current.sales_count === 0 && current.refund_count === 0;

  return (
    <Box>
      {comparisonRange && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Comparé au {rangeLabel(comparisonRange)}
        </Typography>
      )}
      {isEmpty && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Aucune vente sur la période sélectionnée.
        </Alert>
      )}
      <Grid container spacing={3}>
        {CARDS.map((card) => (
          <Grid key={card.title} size={CARD_SIZE}>
            <KpiCard
              title={card.title}
              loading={!current}
              value={current ? card.value(current) : ""}
              subtitle={current && card.subtitle?.(current)}
              change={
                current && comparison
                  ? computeChange(card.figure(current), card.figure(comparison))
                  : null
              }
              changeLabel={COMPARE_LABELS[filters.compare].vs}
              lowerIsBetter={card.lowerIsBetter ?? false}
            />
          </Grid>
        ))}
        {[0, 1].map((i) => (
          <Grid key={`empty-${i}`} size={CARD_SIZE} sx={{ display: { xs: "none", lg: "block" } }}>
            <EmptyKpiCard />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
