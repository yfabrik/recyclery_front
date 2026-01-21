import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { Backspace, Check, Clear } from "@mui/icons-material";

type Resolver<T> = (value: T) => void;

export function usePrompt() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [value, setValue] = useState("");
  const resolverRef = useRef<Resolver<string | null> | null>(null);

  const prompt = useCallback(
    (msg: string, defaultValue = ""): Promise<string | null> => {
      setMessage(msg);
      setValue(defaultValue || "0");
      setOpen(true);

      return new Promise((resolve) => {
        resolverRef.current = resolve;
      });
    },
    [],
  );

  const handleClose = () => {
    setOpen(false);
    if (resolverRef.current) {
      resolverRef.current(null);
      resolverRef.current = null;
    }
  };

  const handleConfirm = () => {
    setOpen(false);
    if (resolverRef.current) {
      // Always return a string when confirming (never null)
      resolverRef.current(value || "0");
      resolverRef.current = null;
    }
  };

  const PromptDialog = (
    <Dialog open={open} onClose={handleConfirm}>
      <DialogTitle>{message}</DialogTitle>
      <DialogContent>
        <NumericKeypad
          onClose={handleConfirm}
          defaultValue={value || "0"}
          value={value}
          setValue={setValue}
        />
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleConfirm} variant="contained">
          OK
        </Button>
      </DialogActions> */}
    </Dialog>
  );

  return { prompt, PromptDialog };
}

interface KeypadProps {
  defaultValue: string | number;
  onClose: () => void;
  maxValue?: number;
  decimalPlaces?: number;
  unit?: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const NumericKeypad = ({
  value,
  setValue,
  defaultValue,
  onClose,
  maxValue = 9999,
  decimalPlaces = 1,
  unit = "kg",
}: KeypadProps) => {
  const addChar = useCallback((char: string | number) => {
    const charStr = char.toString();
    setValue((prev) => {
      const currentValue = prev || "0";
      const [, decimalPart] = currentValue.split(".");

      // Prevent adding decimal point if one already exists
      if (charStr === "." && currentValue.includes(".")) {
        return currentValue;
      }

      // Handle decimal point
      if (charStr === ".") {
        if (!currentValue.includes(".")) {
          return currentValue === "0" ? "0." : currentValue + ".";
        }
        return currentValue;
      }

      // Check if we're at max value
      const numericValue = parseFloat(currentValue + charStr);
      if (numericValue > maxValue) {
        return currentValue;
      }

      // Check decimal places limit
      if (decimalPart && decimalPart.length >= decimalPlaces) {
        return currentValue;
      }

      // Replace "0" with the new character (unless it's a decimal point)
      if (currentValue === "0" && charStr !== ".") {
        return charStr;
      }

      // Add character
      return currentValue + charStr;
    });
  }, [setValue, maxValue, decimalPlaces]);

  const reset = useCallback(() => {
    setValue(defaultValue.toString() || "0");
  }, [setValue, defaultValue]);

  const removeChar = useCallback(() => {
    setValue((prev) => {
      if (prev.length <= 1) {
        return "0";
      }
      return prev.slice(0, -1);
    });
  }, [setValue]);

  // Handle keyboard numpad input
  useEffect(() => {
    // Registry pattern: map event codes/keys to their handlers
    const numpadRegistry: Record<string, () => void> = {
      Numpad0: () => addChar(0),
      Numpad1: () => addChar(1),
      Numpad2: () => addChar(2),
      Numpad3: () => addChar(3),
      Numpad4: () => addChar(4),
      Numpad5: () => addChar(5),
      Numpad6: () => addChar(6),
      Numpad7: () => addChar(7),
      Numpad8: () => addChar(8),
      Numpad9: () => addChar(9),
      NumpadDecimal: () => addChar("."),
      NumpadEnter: () => onClose(),
    };

    const keyRegistry: Record<string, () => void> = {
      "0": () => addChar(0),
      "1": () => addChar(1),
      "2": () => addChar(2),
      "3": () => addChar(3),
      "4": () => addChar(4),
      "5": () => addChar(5),
      "6": () => addChar(6),
      "7": () => addChar(7),
      "8": () => addChar(8),
      "9": () => addChar(9),
      ".": () => addChar("."),
      ",": () => addChar("."),
      Backspace: () => removeChar(),
      Delete: () => reset(),
      Enter: () => onClose(),
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle numpad keys first (by event.code)
      if (event.code.startsWith("Numpad")) {
        const handler = numpadRegistry[event.code];
        if (handler) {
          event.preventDefault();
          handler();
          return; // Don't process regular keys if numpad was used
        }
      }

      // Handle regular keys (by event.key)
      const handler = keyRegistry[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [addChar, removeChar, reset, onClose]);

  const displayValue = value || "0";

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
          {displayValue}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {unit}
        </Typography>
      </Box>

      {/* Clavier numérique */}
      <Grid container spacing={1}>
        {/* Ligne 1: 7, 8, 9 */}
        {[7, 8, 9].map((numero) => (
          <Grid size={{ xs: 3 }} key={numero}>
            <Button
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
            onClick={removeChar}
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
          <Grid size={{ xs: 3 }} key={numero}>
            <Button
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
          <Grid size={{ xs: 3 }} key={numero}>
            <Button
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
            .
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
