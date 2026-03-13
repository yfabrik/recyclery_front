import { Box, CircularProgress, Typography } from "@mui/material"

export const Loading = () => {

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 400,
            }}
        >
            <CircularProgress size={60} />
            <Typography sx={{ ml: 2 }}>Chargement...</Typography>
        </Box>
    )
}