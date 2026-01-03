import { Box, Card, CardContent, Typography, type TypographyOwnProps } from "@mui/material"
import type { ReactNode } from "react"

interface StatCardProps {
    title: string
    value: number | string
    children?: ReactNode
    color?: TypographyOwnProps["color"]
}
export const StatCard = ({ title, value, children, color = "text.secondary" }: StatCardProps) => {
    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box>
                        <Typography color={color} gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4">
                            {value || 0}
                        </Typography>
                    </Box>
                    {children}
                </Box>
            </CardContent>
        </Card>
    )
}

export const StatCardNoIcon = ({ value, title, color }: StatCardProps) => {
    return (
        <Card>
            <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={color} fontWeight="bold">
                    {value || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {title}
                </Typography>
            </CardContent>
        </Card>
    )
}