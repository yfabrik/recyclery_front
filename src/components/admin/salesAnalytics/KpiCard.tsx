import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import { changeTone, formatChange, type Change } from "./change";
import { TONE_COLORS, TREND_ICONS } from "./changeStyles";

type KpiCardProps = {
  title: string;
  value: string;
  subtitle?: string | undefined;
  /** Change vs the comparison range; none shown when null (`compare=none`). */
  change?: Change | null | undefined;
  /** "vs N-1", "vs période préc." */
  changeLabel?: string | undefined;
  /** A rise shows red (refunds). */
  lowerIsBetter?: boolean;
  loading?: boolean;
};

/** One figure of the page, with its change vs the comparison range. */
export const KpiCard = ({
  title,
  value,
  subtitle,
  change,
  changeLabel,
  lowerIsBetter = false,
  loading = false,
}: KpiCardProps) => {
  const TrendIcon = change ? TREND_ICONS[change.direction] : null;
  const color = TONE_COLORS[changeTone(change ?? null, { lowerIsBetter })];
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography color="text.secondary" variant="overline" sx={{ fontSize: "0.75rem" }}>
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
          {loading ? <Skeleton width="60%" /> : value}
        </Typography>
        {subtitle && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
        {change && TrendIcon && !loading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
            <TrendIcon fontSize="small" sx={{ color }} />
            <Typography variant="body2" sx={{ color, fontWeight: 500 }}>
              {formatChange(change)}
            </Typography>
            {changeLabel && (
              <Typography variant="body2" color="text.secondary">
                {changeLabel}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

/** Fills a row of cards on wide screens. */
export const EmptyKpiCard = () => (
  <Card
    variant="outlined"
    sx={{ height: "100%", borderStyle: "dashed", bgcolor: "transparent" }}
    aria-hidden
  />
);
