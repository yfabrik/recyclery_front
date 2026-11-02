import { PersonOff } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";

/** Dashed placeholder shown when a column (or the whole day) has nothing to list. */
export const EmptyColumnMessage = ({ text }: { text: string }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 3,
      bgcolor: "#f5f5f5",
      borderRadius: 1,
      border: "2px dashed #ccc",
    }}
  >
    <PersonOff sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
    <Typography variant="body2" color="textSecondary">
      {text}
    </Typography>
  </Box>
);
