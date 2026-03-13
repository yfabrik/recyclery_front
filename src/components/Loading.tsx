import { Box, CircularProgress, Typography } from "@mui/material"
import type { ReactNode } from "react"

interface LoadingProps {
    isLoading: boolean
    children: ReactNode
    alt?: ReactNode
}
export const Loading = ({ isLoading, children, alt }: LoadingProps) => {

    if (isLoading)
        return alt ?? (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    gap: 2,
                    py:2,
                    // height: 400,
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="body2" color="text.secondary" align="center" >Chargement...</Typography>
            </Box>
        )

    return children
}