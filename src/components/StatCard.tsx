import { Avatar, Box, Card, CardContent, Skeleton, Typography } from "@mui/material"
import { TrendingDown, TrendingFlat, TrendingUp } from "@mui/icons-material"
import type { SvgIconComponent } from "@mui/icons-material"
import type { ReactNode } from "react"

type Trend = "up" | "down" | "flat"
type TrendTone = "success" | "error" | "neutral"

const TREND_ICONS = { up: TrendingUp, down: TrendingDown, flat: TrendingFlat } as const satisfies Record<Trend, SvgIconComponent>
const TONE_COLORS = { success: "success.main", error: "error.main", neutral: "text.secondary" } as const satisfies Record<TrendTone, string>
/** A rise is good by default. */
const DEFAULT_TONES = { up: "success", down: "error", flat: "neutral" } as const satisfies Record<Trend, TrendTone>

interface StatCardProps {
    title: string
    value: number | string
    icon?: ReactNode
    color?: string
    subtitle?: string | undefined
    trend?: Trend | undefined
    trendValue?: string | undefined
    /** Colour of the trend, when it isn't "a rise is good" (refunds). */
    trendTone?: TrendTone | undefined
    /** What the trend compares to. */
    trendLabel?: string | undefined
    /** Shows a skeleton in place of the value, and hides subtitle and trend. */
    loading?: boolean
}

export const StatCard = ({
    title,
    value,
    icon,
    color = "primary",
    subtitle,
    trend,
    trendValue,
    trendTone,
    trendLabel = "vs mois dernier",
    loading = false,
}: StatCardProps) => {
    const showTrend = trend && !loading
    const TrendIcon = trend ? TREND_ICONS[trend] : null
    const trendColor = trend ? TONE_COLORS[trendTone ?? DEFAULT_TONES[trend]] : undefined
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
                        mb: showTrend ? 2 : 0,
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
                            {loading ? <Skeleton width="60%" /> : value || 0}
                        </Typography>
                        {subtitle && !loading && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>

                    {icon && <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>{icon}</Avatar>}
                </Box>

                {showTrend && TrendIcon && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TrendIcon fontSize="small" sx={{ color: trendColor }} />
                        <Typography variant="body2" sx={{ color: trendColor }}>
                            {trendValue}
                        </Typography>
                        {trendLabel && (
                            <Typography variant="body2" color="text.secondary">
                                {trendLabel}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    )
}
