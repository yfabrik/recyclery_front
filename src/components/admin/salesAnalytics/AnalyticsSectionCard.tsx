import { Alert, Box, Card, CardContent, Typography } from "@mui/material";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Loading } from "../../Loading";

type QueryStateProps<T> = {
  query: Pick<UseQueryResult<T>, "data" | "isLoading" | "isError">;
  /** True when the data has nothing to show. */
  isEmpty?: (data: T) => boolean;
  emptyMessage?: string;
  errorMessage?: string;
  children: (data: T) => ReactNode;
};

/** Loading, error and empty states of a section's query, then its content. */
export const AnalyticsQueryState = <T,>({
  query,
  isEmpty,
  emptyMessage = "Aucune vente sur la période sélectionnée.",
  errorMessage = "Erreur lors du chargement des statistiques.",
  children,
}: QueryStateProps<T>) => {
  if (query.isError) return <Alert severity="error">{errorMessage}</Alert>;
  if (query.isLoading || query.data === undefined)
    return <Loading isLoading>{null}</Loading>;
  if (isEmpty?.(query.data)){
    return <Alert severity="info">{emptyMessage}</Alert>;
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    );}
  return children(query.data);
};

type SectionCardProps<T> = QueryStateProps<T> & {
  title: ReactNode;
  icon?: ReactNode;
  /** Right of the title: CSV button, switches. */
  actions?: ReactNode;
};

/** Card of a titled section: title, actions, then its query's states and content. */
export const AnalyticsSectionCard = <T,>({
  title,
  icon,
  actions,
  ...state
}: SectionCardProps<T>) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {icon}
          {title}
        </Typography>
        {actions}
      </Box>
      <AnalyticsQueryState {...state} />
    </CardContent>
  </Card>
);
