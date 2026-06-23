import { FileDownload } from "@mui/icons-material";
import { Button, ListItemText, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export type ExportScope = "filtered" | "all";

type ExportCsvButtonProps = {
  onExport: (scope: ExportScope) => Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
};

export const ExportCsvButton = ({
  onExport,
  disabled = false,
  loading = false,
  label = "Exporter CSV",
}: ExportCsvButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingScope, setPendingScope] = useState<ExportScope | null>(null);

  const open = Boolean(anchorEl);
  const isBusy = loading || pendingScope !== null;

  const handleExport = async (scope: ExportScope) => {
    setPendingScope(scope);
    try {
      await onExport(scope);
      setAnchorEl(null);
    } finally {
      setPendingScope(null);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<FileDownload />}
        disabled={disabled || isBusy}
        loading={isBusy}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          disabled={isBusy}
          onClick={() => void handleExport("filtered")}
        >
          <ListItemText primary="Exporter (filtres actuels)" />
        </MenuItem>
        <MenuItem disabled={isBusy} onClick={() => void handleExport("all")}>
          <ListItemText primary="Exporter tout" />
        </MenuItem>
      </Menu>
    </>
  );
};
