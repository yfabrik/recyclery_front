import { Box, Typography } from "@mui/material";

const Banner = () => {
  const envText = import.meta.env.VITE_BANNER_TEXT;

  // Don't render if the environment variable is not set
  if (!envText) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        py: 1.5,
        px: 2,
        zIndex: 1000,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        display: { xs: "none", sm: "block" }, // Only show on desktop (sm and up)
      }}
    >
      <Typography variant="body2" align="left">
        Hello World - {envText}
      </Typography>
    </Box>
  );
};

export default Banner;
