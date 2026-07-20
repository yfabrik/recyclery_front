import { RestartAlt } from "@mui/icons-material";
import { Button, type ButtonProps } from "@mui/material";

type ResetFiltersButtonProps = {
  onReset: () => void;
  label?: string;
} & Omit<ButtonProps, "onClick" | "type">;

export const ResetFiltersButton = ({
  onReset,
  label = "Réinitialiser les filtres",
  variant = "outlined",
  ...buttonProps
}: ResetFiltersButtonProps) => {
  return (
    <Button
      variant={variant}
      type="button"
      startIcon={<RestartAlt />}
      onClick={onReset}
      {...buttonProps}
    >
      {label}
    </Button>
  );
};

export default ResetFiltersButton;
