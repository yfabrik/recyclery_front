import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography
} from "@mui/material";
import { useCallback, useState } from "react";

import { Backspace, Check, Clear } from "@mui/icons-material";

export function usePrompt() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [value, setValue] = useState("");
  const [resolver, setResolver] = useState(null);

  const prompt = useCallback((msg, defaultValue = "") => {
    setMessage(msg);
    setValue(defaultValue);
    setOpen(true);

    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
    resolver?.(null);
  };

  const handleConfirm = () => {
    setOpen(false);
    resolver?.(value);
  };

  const PromptDialog = (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{message}</DialogTitle>
      <DialogContent>
        <NumericKeypad onClose={handleConfirm} defaultValue={0} value={value} setValue={setValue} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { prompt, PromptDialog };
}

interface keypadProps {
  defaultValue: string | number;
  onClose: () => void;
  maxValue?: number;
  decimalPlaces?: number;
  unit?: string;
  value:string,
  setValue:React.Dispatch<React.SetStateAction<string>>
}
const NumericKeypad = ({
  value,
  setValue,
  defaultValue,
  onClose,
  maxValue = 9999,
  decimalPlaces = 1,
  unit = "kg",
}: keypadProps) => {
  // const [value, setValue] = useState<string>(defaultValue.toString() || "0");

  const addChar = (char: string | number) => {
    const c = char.toString();
    const [entier, decimal] = value.split(".");
    if (c == "." && value.includes(".")) return;
    if (
      entier.length >= maxValue.toString().length &&
      decimal &&
      decimal.length == decimalPlaces
    )
      return setValue(maxValue.toString());
    if (entier.length >= maxValue.toString().length && !decimal)
      return setValue((prev) => (c != "." ? prev + "." + c : prev + c));
    if (value == "0") return setValue(c);

    return setValue((prev) => prev + c);
  };
  const reset = () => {
    setValue(defaultValue.toString());
  };
  const removeChar = () => {
    setValue((prev) => prev.slice(0, -1));
  };
  // const addChar = (number) => {
  //   const currentValue = value.toString();

  // // Si c'est "0", remplacer par le nouveau chiffre
  // if (currentValue === '0') {
  //   onChange(number.toString());
  //   return;
  // }

  // // Vérifier si on peut ajouter un décimal
  // if (number === '.' || number === ',') {
  //   if (currentValue.includes('.') || currentValue.includes(',')) {
  //     return; // Déjà un décimal
  //   }
  //   onChange(currentValue + '.');
  //   return;
  // }

  // // Vérifier la limite de décimales
  // if (currentValue.includes('.')) {
  //   const decimalPart = currentValue.split('.')[1];
  //   if (decimalPart && decimalPart.length >= decimalPlaces) {
  //     return;
  //   }
  // }

  //   const newValue = currentValue + number.toString();
  //   const numericValue = parseFloat(newValue);

  //   if (numericValue <= maxValue) {
  //     onChange(newValue);
  //   }
  // };

  // const handleBackspace = () => {
  //   const currentValue = value.toString();
  //   if (currentValue.length > 1) {
  //     onChange(currentValue.slice(0, -1));
  //   } else {
  //     onChange('0');
  //   }
  // };

  // const handleClear = () => {
  //   onChange('0');
  // };

  // const formatDisplayValue = () => {
  //   if (!value || value === '0') return '0';
  //   return value.toString();
  // };

  return (
    <Box sx={{ minWidth: 280 }}>
      {/* Affichage de la valeur */}
      <Box
        sx={{
          mb: 3,
          p: 3,
          backgroundColor: "#f8f9fa",
          borderRadius: 2,
          border: "2px solid #e3f2fd",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="primary.main">
          {value}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {unit}
        </Typography>
      </Box>

      {/* Clavier numérique */}
      <Grid container spacing={1}>
        {/* Ligne 1: 7, 8, 9 */}
        {[7, 8, 9].map((numero) => (
          <Grid size={{ xs: 3 }}>
            <Button
              key={numero}
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => addChar(numero)}
              sx={{
                minHeight: 50,
                fontSize: "1.3rem",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              {numero}
            </Button>
          </Grid>
        ))}

        <Grid size={{ xs: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => removeChar()}
            sx={{
              minHeight: 50,
              color: "error.main",
              borderColor: "error.main",
              "&:hover": {
                backgroundColor: "#ffebee",
                borderColor: "error.main",
              },
            }}
          >
            <Backspace />
          </Button>
        </Grid>
        {/* Ligne 2: 4, 5, 6 */}
        {[4, 5, 6].map((numero) => (
          <Grid size={{ xs: 3 }}>
            <Button
              key={numero}
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => addChar(numero)}
              sx={{
                minHeight: 50,
                fontSize: "1.3rem",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              {numero}
            </Button>
          </Grid>
        ))}

        <Grid size={{ xs: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={reset}
            sx={{
              minHeight: 50,
              color: "warning.main",
              borderColor: "warning.main",
              "&:hover": {
                backgroundColor: "#fff3e0",
                borderColor: "warning.main",
              },
            }}
          >
            <Clear />
          </Button>
        </Grid>

        {/* Ligne 3: 1, 2, 3 */}
        {[1, 2, 3].map((numero) => (
          <Grid size={{ xs: 3 }}>
            <Button
              key={numero}
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => addChar(numero)}
              sx={{
                minHeight: 50,
                fontSize: "1.3rem",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              {numero}
            </Button>
          </Grid>
        ))}

        <Grid size={{ xs: 3 }}>{/* Espace réservé */}</Grid>

        {/* Ligne 4: 0, . */}
        <Grid size={{ xs: 6 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => addChar(0)}
            sx={{
              minHeight: 50,
              fontSize: "1.3rem",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#e3f2fd" },
            }}
          >
            0
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => addChar(".")}
            sx={{
              minHeight: 50,
              fontSize: "1.3rem",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#e3f2fd" },
            }}
          >
            ,
          </Button>
        </Grid>
        <Grid size={{ xs: 3 }}>{/* Espace pour l'alignement */}</Grid>
      </Grid>

      {/* Boutons de raccourci pour poids courants */}
      <Box sx={{ mt: 2 }}>
        <Typography
          variant="caption"
          color="textSecondary"
          gutterBottom
          display="block"
        >
          Poids fréquents :
        </Typography>
        <Grid container spacing={1}>
          {[0.5, 1, 2, 5, 10, 20].map((weight) => (
            <Grid size={{ xs: 2 }} key={weight}>
              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => setValue(weight.toString())}
                sx={{
                  minHeight: 35,
                  fontSize: "0.8rem",
                  color: "primary.main",
                  border: "1px solid transparent",
                  "&:hover": {
                    backgroundColor: "#e3f2fd",
                    border: "1px solid #1976d2",
                  },
                }}
              >
                {weight}
                {unit}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Bouton fermer en bas */}
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Check />}
          sx={{
            minWidth: 120,
            "&:hover": { backgroundColor: "#e8f5e8" },
          }}
        >
          Valider
        </Button>
      </Box>
    </Box>
  );
};
