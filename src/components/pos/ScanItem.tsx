import { Add, QrCodeScanner } from "@mui/icons-material";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../utils/apiToastMessage";
import type { LabeledItemModel } from "../../interfaces/Models";
import { getItemFromBarcode } from "../../services/api/labeledItems";

interface ScanItemProps {
  onManualItem: () => void;
  addToCart: (item: LabeledItemModel) => boolean;
}

export const ScanItem = ({ onManualItem, addToCart }: ScanItemProps) => {
  const [scanInput, setScanInput] = useState("");

  const handleScanProduct = async () => {
    if (!scanInput.trim()) {
      toast.error("Veuillez saisir un code-barres");
      return;
    }

    try {
      const response = await getItemFromBarcode(scanInput);
      const item = response.data.data;

      if (item.status !== "available") {
        toast.error("Cet article n'est pas disponible à la vente");
        return;
      }

      if (addToCart(item)) {
        setScanInput("");
        toast.success(`${item.barcode} ajouté au panier`);
      }
    } catch (error) {
      const requestError = error as { response?: { status?: number } };
      if (requestError.response?.status === 404) {
        toast.error("Article non trouvé");
      } else {
        toast.error(getApiErrorMessage(error, "Erreur lors du scan"));
      }
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Ajouter Article
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Scanner ou saisir le code-barres..."
          value={scanInput}
          onChange={(e) => setScanInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleScanProduct()}
          slotProps={{
            input: {
              startAdornment: (
                <QrCodeScanner sx={{ mr: 1, color: "text.secondary" }} />
              ),
            },
          }}
        />
        <Button
          variant="contained"
          type="button"
          onClick={handleScanProduct}
          sx={{ minWidth: 100 }}
          disabled={scanInput.trim().length < 1}
        >
          Scanner
        </Button>
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={onManualItem}
          sx={{ minWidth: 200 }}
        >
          Article Manuel
        </Button>
      </Box>
    </Paper>
  );
};
