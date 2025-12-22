import { Typography, Box, Paper } from "@mui/material";

interface SimpleChartProps {
  data: [number];
  title: string;
  color?: string;
  labels: [string];
}

export const SimpleChart = ({
  data,
  title,
  color = "primary",
  labels,
}: SimpleChartProps) => (
  <Paper sx={{ p: 2, height: "100%" }}>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Box
      sx={{ display: "flex", alignItems: "end", gap: 1, height: 120, mt: 2 }}
    >
      {data.map((value, index) => (
        <Box
          key={index}
          sx={{
            flexGrow: 1,
            height: `${(value / Math.max(...data)) * 100}%`,
            bgcolor: `${color}.main`,
            borderRadius: 1,
            minHeight: 20,
            display: "flex",
            alignItems: "end",
            justifyContent: "center",
            color: "white",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {value}
        </Box>
      ))}
    </Box>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mt: 1,
        fontSize: "0.75rem",
      }}
    >
      {labels ? (
        labels.map((label, index) => (
          <Typography key={index} variant="caption">
            {label}
          </Typography>
        ))
      ) : (
        <>
          <Typography variant="caption">Lun</Typography>
          <Typography variant="caption">Mar</Typography>
          <Typography variant="caption">Mer</Typography>
          <Typography variant="caption">Jeu</Typography>
          <Typography variant="caption">Ven</Typography>
          <Typography variant="caption">Sam</Typography>
          <Typography variant="caption">Dim</Typography>
        </>
      )}
    </Box>
  </Paper>
);
