import { Avatar, Box, Card, CardContent, Typography } from "@mui/material"
import { TrendingDown, TrendingUp } from "@mui/icons-material"
import type { ReactNode } from "react"

interface StatCardProps {
    title: string
    value: number | string
    icon?: ReactNode
    color?: string
    subtitle?: string
    trend?: "up" | "down"
    trendValue?: string
}

export const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
    trendValue,
}: StatCardProps) => {
    return (
        <Card
            sx={{
                height: "100%",
                transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: trend ? 2 : 0,
                        gap: 2,
                    }}
                >
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography
                            color="text.secondary"
                            gutterBottom
                            variant="overline"
                            sx={{ fontSize: "0.75rem" }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h4"
                            component="div"
                            color={`${color}.main`}
                            sx={{ fontWeight: "bold" }}
                        >
                            {value || 0}
                        </Typography>
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {icon && <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>{icon}</Avatar>}
                </Box>

                {trend && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {trend === "up" ? (
                            <TrendingUp color="success" fontSize="small" />
                        ) : (
                            <TrendingDown color="error" fontSize="small" />
                        )}
                        <Typography variant="body2" color={trend === "up" ? "success.main" : "error.main"}>
                            {trendValue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            vs mois dernier
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}