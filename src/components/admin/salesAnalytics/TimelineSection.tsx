import { ShowChart } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { salesTimelineRoute } from "../../../services/api/salesAnalytics";
import { AnalyticsSectionCard } from "./AnalyticsSectionCard";
import { COMPARE_LABELS } from "./filters";
import type { SalesAnalyticsSectionProps } from "./sections";
import { isTimelineEmpty, STEP_LABELS, timelinePoints } from "./timeline";
import { TimelineChart } from "./TimelineChart";
import { useSalesAnalytics } from "./useSalesAnalytics";

/** Revenue over time: net revenue by day, week or month, against the comparison range. */
export const TimelineSection = ({ filters }: SalesAnalyticsSectionProps) => {
  const timeline = useSalesAnalytics(salesTimelineRoute, filters);
  const step = timeline.data?.current.step;

  return (
    <AnalyticsSectionCard
      title="Chiffre d'affaires"
      icon={<ShowChart />}
      query={timeline}
      isEmpty={isTimelineEmpty}
      actions={
        step && (
          <Typography variant="body2" color="text.secondary">
            {STEP_LABELS[step]}
          </Typography>
        )
      }
    >
      {(data) => (
        <TimelineChart
          points={timelinePoints(data)}
          comparisonLabel={
            data.comparison ? COMPARE_LABELS[filters.compare].option || "Comparaison" : null
          }
        />
      )}
    </AnalyticsSectionCard>
  );
};
