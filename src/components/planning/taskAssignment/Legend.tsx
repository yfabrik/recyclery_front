import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { sampleEmployeeColor } from "../../../employee";
import { BLOCKED_FILL } from "./geometry";

type LegendSwatchProps = {
  fill: string;
  label: string;
};

const LegendSwatch = ({ fill, label }: LegendSwatchProps) => (
  <Stack direction="row" spacing={0.5} alignItems="center">
    <Box
      sx={{
        width: 16,
        height: 10,
        borderRadius: 0.5,
        bgcolor: fill.startsWith("repeating") ? undefined : fill,
        background: fill.startsWith("repeating") ? fill : undefined,
        border: "1px solid #b0bec5",
      }}
    />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Stack>
);

/** Explains the assigned column's colours: each Employee keeps their own colour. */
export const AssignedColumnLegend = () => (
  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
    <LegendSwatch fill={alpha(sampleEmployeeColor, 0.35)} label="Plage horaire de la tâche" />
    <LegendSwatch fill={sampleEmployeeColor} label="Assigné (couleur par employé)" />
    <LegendSwatch fill={BLOCKED_FILL} label="Non assignable" />
  </Stack>
);
