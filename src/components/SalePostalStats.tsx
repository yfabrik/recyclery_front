import { LocalPostOffice, Place } from "@mui/icons-material";
import { Box, Card, CardContent, Divider, Typography } from "@mui/material";
import { formatCurrency } from "../services/cartService";
import { useQuery } from "@tanstack/react-query";
import type { TransactionStatsFilterInput } from "@recyclerie/api/schemas/salesTransactions";
import { getTranscationPostalStats } from "../services/api/transactions";
import { Loading } from "./Loading";

interface SalePostalStatsProps {
  filters: TransactionStatsFilterInput;
}
export const SalePostalStats = ({ filters }: SalePostalStatsProps) => {
  const postalCodeStats = useQuery({
    queryKey: ["transactionsPostalStats", filters],
    queryFn: () =>
      getTranscationPostalStats(filters).then(
        (response) => response.data.data,
      ),
  });

  return (
    <Card>
      <CardContent>
        <Loading isLoading={postalCodeStats.isLoading}>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Place fontSize="small" />
            Top des codes postaux
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Les 10 codes postaux générant le plus de chiffre d'affaires
          </Typography>
          {postalCodeStats.data?.slice(0, 10).map((postal, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="body2" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocalPostOffice sx={{ fontSize: 16 }} />
                  {postal.customer_postal_code}
                </Typography>
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight="bold"
                >
                  {formatCurrency(Number(postal.total_sales))}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="textSecondary">
                  {Number(postal.transaction_count)} transaction
                  {Number(postal.transaction_count) > 1 ? "s" : ""}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Panier moyen: {formatCurrency(Number(postal.average_transaction))}
                </Typography>
              </Box>
              {index < postalCodeStats.data?.slice(0, 10).length - 1 && (
                <Divider sx={{ mt: 1 }} />
              )}
            </Box>
          ))}
        </Loading>
      </CardContent>
    </Card>
  );
};
