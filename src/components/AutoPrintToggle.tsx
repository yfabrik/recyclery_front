import { Print } from "@mui/icons-material";
import { Box, Switch, Typography } from "@mui/material";

type AutoPrintToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const AutoPrintToggle = ({ checked, onChange }: AutoPrintToggleProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      p: 2,
      mt: 2,
      backgroundColor: "#f8f9fa",
      borderRadius: 1,
      border: "1px solid #e0e0e0",
    }}
  >
    <Print sx={{ color: "primary.main" }} />
    <Box sx={{ flex: 1 }}>
      <Typography variant="subtitle2" fontWeight="medium">
        Impression automatique
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Imprimer l'étiquette automatiquement après la sauvegarde
      </Typography>
    </Box>
    <Switch
      checked={checked}
      onChange={(_, value) => onChange(value)}
      slotProps={{ input: { "aria-label": "Impression automatique" } }}
    />
  </Box>
);
