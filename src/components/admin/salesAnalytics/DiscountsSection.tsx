import type {
  SalesDiscountsDto,
  WholeTransactionDiscountDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { FileDownload, LocalOffer } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { salesDiscountsRoute } from "../../../services/api/salesAnalytics";
import { formatCurrency, formatPercentage } from "../../../services/cartService";
import { downloadCsv, rowsToCsv } from "../../../utils/csv";
import { AnalyticsSectionCard } from "./AnalyticsSectionCard";
import { computeChange, formatChange } from "./change";
import { TREND_ICONS } from "./changeStyles";
import {
  comparisonDiscountGroup,
  DISCOUNTS_CSV_COLUMNS,
  discountsCsvRows,
} from "./discountsCsv";
import { COMPARE_LABELS } from "./filters";
import { countLabel, formatCount } from "./format";
import type { SalesAnalyticsSectionProps } from "./sections";
import { useSalesAnalytics } from "./useSalesAnalytics";


/**
 * Change vs the comparison range, in a neutral colour: more discount is
 * neither good nor bad news by itself.
 */
const DiscountChange = ({
  current,
  comparison,
  vs,
}: {
  current: number;
  comparison: number | null | undefined;
  vs: string;
}) => {
  const change = computeChange(current, comparison);
  if (!change) return null;
  const Icon = TREND_ICONS[change.direction];
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}
    >
      <Icon fontSize="inherit" />
      <Typography component="span" variant="caption">
        {formatChange(change)} {vs}
      </Typography>
    </Box>
  );
};

type FiguresProps = { current: SalesDiscountsDto; comparison: SalesDiscountsDto | null; vs: string };

const Totals = ({ current, comparison, vs }: FiguresProps) => (
  <Box>
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 1 }}>
      <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
        {formatCurrency(current.total_discount)}
      </Typography>
      <DiscountChange
        current={current.total_discount}
        comparison={comparison?.total_discount}
        vs={vs}
      />
    </Box>
    <Typography variant="body2" color="text.secondary">
      {formatPercentage(current.share_of_gross_revenue)} du CA brut (
      {formatCurrency(current.gross_revenue)})
    </Typography>
    <Stack direction="row" spacing={3} sx={{ mt: 1.5, flexWrap: "wrap" }}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Promotions sur articles
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {formatCurrency(current.category_promotion_discount)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          promotion de catégorie ou % saisi en caisse
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Remises sur le ticket
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {formatCurrency(current.whole_transaction_discount)}
        </Typography>
      </Box>
    </Stack>
  </Box>
);

const TopCategories = ({ current }: { current: SalesDiscountsDto }) => {
  if (current.top_categories.length === 0) return null;
  const largest = current.top_categories[0]?.discount ?? 0;
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Top 5 des catégories par remise
      </Typography>
      <Stack spacing={1}>
        {current.top_categories.map((category) => (
          <Box key={category.category_id ?? "none"}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
              <Typography variant="body2" noWrap>
                {category.name}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
                {formatCurrency(category.discount)}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={largest > 0 ? (category.discount / largest) * 100 : 0}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

const StoreSplit = ({ group }: { group: WholeTransactionDiscountDto }) => {
  if (!group.by_store || group.by_store.length === 0) return null;
  return (
    <Table size="small" sx={{ mt: 1 }}>
      <TableHead>
        <TableRow>
          <TableCell>Magasin</TableCell>
          <TableCell align="right">Ventes</TableCell>
          <TableCell align="right">Remise</TableCell>
          <TableCell align="right">Panier avant → après</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {group.by_store.map((store) => (
          <TableRow key={store.store_id}>
            <TableCell>{store.store_name}</TableCell>
            <TableCell align="right">{formatCount(store.sales_count)}</TableCell>
            <TableCell align="right">{formatCurrency(store.discount_amount)}</TableCell>
            <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
              {formatCurrency(store.average_basket_before)} →{" "}
              {formatCurrency(store.average_basket_after)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

/** A notable discount (or "Autres"): its Sales, amount, baskets and change. */
const DiscountGroup = ({
  group,
  comparison,
  vs,
  showStores,
}: {
  group: WholeTransactionDiscountDto;
  comparison: WholeTransactionDiscountDto | null;
  vs: string;
  showStores: boolean;
}) => (
  <Paper variant="outlined" sx={{ p: 1.5 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 1 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
        {group.key === "other" ? group.label : `Remise ${group.label}`}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
        {formatCurrency(group.discount_amount)}
      </Typography>
    </Box>
    <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {countLabel(group.sales_count, "vente")} ({formatPercentage(group.share_of_sales)} des ventes)
      </Typography>
      <DiscountChange
        current={group.discount_amount}
        comparison={comparison?.discount_amount}
        vs={vs}
      />
    </Box>
    {group.sales_count > 0 && (
      <Typography variant="body2" color="text.secondary">
        Panier moyen {formatCurrency(group.average_basket_before)} →{" "}
        {formatCurrency(group.average_basket_after)}
      </Typography>
    )}
    {comparison && (
      <Typography variant="caption" color="text.secondary">
        {vs} : {countLabel(comparison.sales_count, "vente")},{" "}
        {formatCurrency(comparison.discount_amount)}
      </Typography>
    )}
    {showStores && <StoreSplit group={group} />}
  </Paper>
);

/**
 * Discounts given on Sales: Category promotions and whole-transaction
 * discounts, the top categories, then the notable discounts and "Autres".
 * Refunds never reduce a discount.
 */
export const DiscountsSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const discounts = useSalesAnalytics(salesDiscountsRoute, filters);
  const vs = COMPARE_LABELS[filters.compare].vs;
  const data = discounts.data;

  const exportCsv = () => {
    if (!data) return;
    downloadCsv(
      `remises-${data.ranges.current.date_from}-${data.ranges.current.date_to}.csv`,
      rowsToCsv(discountsCsvRows(data.current, data.comparison), DISCOUNTS_CSV_COLUMNS),
    );
  };

  return (
    <AnalyticsSectionCard
      title="Remises"
      icon={<LocalOffer />}
      query={discounts}
      isEmpty={(d) => d.current.sales_count === 0}
      actions={
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownload />}
          disabled={!data || data.current.sales_count === 0}
          onClick={exportCsv}
        >
          Exporter CSV
        </Button>
      }
    >
      {({ current, comparison }) => (
        <Stack spacing={2} divider={<Divider flexItem />}>
          <Totals current={current} comparison={comparison} vs={vs} />
          <TopCategories current={current} />
          <Stack spacing={1.5}>
            {current.whole_transaction_discounts.map((group) => (
              <DiscountGroup
                key={group.key}
                group={group}
                comparison={comparisonDiscountGroup(comparison, group.key)}
                vs={vs}
                showStores={filters.store_id === ""}
              />
            ))}
          </Stack>
        </Stack>
      )}
    </AnalyticsSectionCard>
  );
};
