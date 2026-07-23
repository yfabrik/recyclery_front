import { Box, CircularProgress, TableCell, TableRow, Typography } from "@mui/material"
import type { ReactNode } from "react"

interface LoadingProps {
    isLoading: boolean
    children: ReactNode
    tableCols?: number
    text?: string
}
export const Loading = ({ isLoading, children, tableCols = 0, text = "Chargement..." }: LoadingProps) => {

    if (!isLoading)
        return children
    if (tableCols)
        return (
            <TableRow>
                <TableCell colSpan={tableCols} align="center">
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            gap: 2,
                            py: 2
                        }}
                    >
                        <CircularProgress size={60} />
                        <Typography variant="body2" color="text.secondary" align="center" >{text}</Typography>
                    </Box>
                </TableCell>
            </TableRow>
        )

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: 2,
                py: 2,
                // height: 400,
            }}
        >
            <CircularProgress size={60} />
            <Typography variant="body2" color="text.secondary" align="center" >{text}</Typography>
        </Box>
    )
}
