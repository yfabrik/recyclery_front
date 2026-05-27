import { Box, Card, CardContent, Divider, Typography } from "@mui/material"
import { formatCurrency, getPaymentMethodLabel } from "../services/cartService"
import { useQuery } from "@tanstack/react-query";
import { getTranscationStats, type transactionsFilters } from "../services/api/transactions";
import { Loading } from "./Loading";
import { CreditCard } from "@mui/icons-material";

interface SalePaymentStatsProps {
    filters: transactionsFilters;
}
export const SalePaymentStats = ({ filters }: SalePaymentStatsProps) => {
    const statistics = useQuery({
        queryKey: ["transactionsStats", filters],
        queryFn: () =>
            getTranscationStats(filters).then((response) => response.data.stats),
        placeholderData: {
            total_transactions: 0,
            total_sales: 0,
            total_sales_before_refunds: 0,
            total_refunded: 0,
            average_transaction: 0,
            sessions_count: 0,
            payment_methods: [],
            by_day: [],
            by_category: [],
        } as Awaited<
            ReturnType<typeof getTranscationStats>
        >["data"]["stats"],
    });
    return (
        <Card>
            <CardContent>
                <Loading isLoading={statistics.isLoading}>
                    <Typography variant="h6" gutterBottom>
                        <CreditCard/> Répartition par mode de paiement
                    </Typography>
                    {statistics.data?.payment_methods.map((method, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.5,
                                }}
                            >
                                <Typography variant="body2">
                                    {getPaymentMethodLabel(method.payment_method)}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {method.count} (
                                    {(
                                        (method.count /
                                            statistics.data?.total_transactions) *
                                        100
                                    ).toFixed(1)}
                                    %)
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <Typography variant="body2" color="textSecondary">
                                    Montant total
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="success.main"
                                    fontWeight="bold"
                                >
                                    {formatCurrency(method.total)}
                                </Typography>
                            </Box>
                            <Divider sx={{ mt: 1 }} />
                        </Box>
                    ))}
                </Loading>
            </CardContent>
        </Card>

    )
}