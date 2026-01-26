import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  IconButton,
  TextField,
  Stack,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  Backspace,
  Check,
  Clear,
  Add,
  Remove,
  AttachMoney,
  Euro,
} from "@mui/icons-material";

type Resolver<T> = (value: T) => void;

type PromptMode = "numeric" | "money";

export function usePrompt() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState("kg");
  const [mode, setMode] = useState<PromptMode>("numeric");
  const resolverRef = useRef<Resolver<string | null> | null>(null);

  const prompt = useCallback(
    (
      msg: string,
      defaultValue = "",
      options?: { unit?: string; mode?: PromptMode },
    ): Promise<string | null> => {
      setMessage(msg);
      setValue(defaultValue || "0");
      setUnit(options?.unit || "kg");
      setMode(options?.mode || "numeric");
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
    <Dialog open={open} onClose={handleConfirm} maxWidth={mode === "money" ? "lg" : "sm"}
      fullWidth>
      <DialogTitle>{message}</DialogTitle>
      <DialogContent>
        {mode === "money" ? (
          <MoneyCounterPrompt
            onClose={handleConfirm}
            defaultValue={value || "0"}
            value={value}
            setValue={setValue}
          />
        ) : (
          <NumericKeypad
            onClose={handleConfirm}
            defaultValue={value || "0"}
            value={value}
            setValue={setValue}
            unit={unit}

          />
        )}
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

interface MoneyCounterPromptProps {
  defaultValue: string | number;
  onClose: () => void;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

// Définition des pièces et billets français
const MONEY_DENOMINATIONS = [
  // Pièces
  { value: 0.01, label: "1 centime", type: "coin", color: "#FFD700" },
  { value: 0.02, label: "2 centimes", type: "coin", color: "#FFD700" },
  { value: 0.05, label: "5 centimes", type: "coin", color: "#FFD700" },
  { value: 0.1, label: "10 centimes", type: "coin", color: "#FFD700" },
  { value: 0.2, label: "20 centimes", type: "coin", color: "#FFD700" },
  { value: 0.5, label: "50 centimes", type: "coin", color: "#FFD700" },
  { value: 1, label: "1 €", type: "coin", color: "#C0C0C0" },
  { value: 2, label: "2 €", type: "coin", color: "#C0C0C0" },

  // Billets
  { value: 5, label: "5 €", type: "bill", color: "#87CEEB" },
  { value: 10, label: "10 €", type: "bill", color: "#98FB98" },
  { value: 20, label: "20 €", type: "bill", color: "#F0E68C" },
  { value: 50, label: "50 €", type: "bill", color: "#DDA0DD" },
  { value: 100, label: "100 €", type: "bill", color: "#F4A460" },
  { value: 200, label: "200 €", type: "bill", color: "#CD853F" },
  { value: 500, label: "500 €", type: "bill", color: "#B0C4DE" },
] as const;

const MoneyCounterPrompt = ({
  value,
  setValue,
  defaultValue,
  onClose,
}: MoneyCounterPromptProps) => {

  const [counts, setCounts] = useState<Record<number, number>>({});

  // Initialize counts from defaultValue if provided
  useEffect(() => {
    const defaultNum = parseFloat(defaultValue?.toString() || "0");
    if (defaultNum > 0) {
      // Try to parse the default value into counts
      // For simplicity, we'll just set the total value
      // The user can adjust the counts manually
    }
  }, [defaultValue]);

  // Calculate total and update value
  useEffect(() => {
    const newTotal = MONEY_DENOMINATIONS.reduce((sum, denom) => {
      const count = counts[denom.value] || 0;
      return sum + count * denom.value;
    }, 0);
    setValue(newTotal.toFixed(2));
  }, [counts, setValue]);

  const updateCount = (denomValue: number, change: number) => {
    setCounts((prev) => ({
      ...prev,
      [denomValue]: Math.max(0, (prev[denomValue] || 0) + change),
    }));
  };

  const setCount = (denomValue: number, newCount: string) => {
    setCounts((prev) => ({
      ...prev,
      [denomValue]: Math.max(0, parseInt(newCount) || 0),
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getTotalByType = (type: string) => {
    return MONEY_DENOMINATIONS.filter((denom) => denom.type === type)
      .reduce((sum, denom) => {
        const count = counts[denom.value] || 0;
        return sum + count * denom.value;
      }, 0);
  };

  const coinsTotal = getTotalByType("coin");
  const billsTotal = getTotalByType("bill");
  const total = parseFloat(value || "0");

  return (
    <Box sx={{ minWidth: 280, maxHeight: "70vh", overflow: "auto" }}>
      {/* Affichage du total */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          backgroundColor: "primary.main",
          borderRadius: 2,
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {formatCurrency(total)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
          {formatCurrency(coinsTotal)} en pièces + {formatCurrency(billsTotal)}{" "}
          en billets
        </Typography>
      </Box>

      <Grid container spacing={1}>
        {/* Pièces */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ maxHeight: "50vh", overflow: "auto" }}>
            <CardContent>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <Euro fontSize="small" color="primary" />
                Pièces
              </Typography>
              <Stack spacing={0.5}>
                {MONEY_DENOMINATIONS.filter((d) => d.type === "coin")
                  .map((denom) => (
                    <Box
                      key={denom.value}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          backgroundColor: denom.color,
                          border: "1px solid #333",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "8px",
                          fontWeight: "bold",
                          color: "#333",
                          flexShrink: 0,
                        }}
                      >
                        {denom.value < 1
                          ? `${denom.value * 100}c`
                          : `${denom.value}€`}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ minWidth: 70, flexShrink: 0 }}
                      >
                        {denom.label}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateCount(denom.value, -1)}
                        disabled={!counts[denom.value]}
                        sx={{ p: 0.5, flexShrink: 0 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        value={counts[denom.value] || 0}
                        onChange={(e) => setCount(denom.value, e.target.value)}
                        type="number"
                        slotProps={{
                          htmlInput: {
                            style: { textAlign: "center", width: 50 },
                            min: 0,
                          },
                        }}
                        sx={{ "& .MuiInputBase-root": { height: 28 }, flexShrink: 0 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => updateCount(denom.value, 1)}
                        sx={{ p: 0.5, flexShrink: 0 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          minWidth: 70,
                          textAlign: "right",
                          ml: "auto",
                          fontWeight: "medium",
                        }}
                      >
                        {formatCurrency((counts[denom.value] || 0) * denom.value)}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" fontWeight="bold">
                  Total pièces:
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="primary">
                  {formatCurrency(coinsTotal)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Billets */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ maxHeight: "50vh", overflow: "auto" }}>
            <CardContent>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <AttachMoney fontSize="small" color="success" />
                Billets
              </Typography>
              <Stack spacing={0.5}>
                {MONEY_DENOMINATIONS.filter((d) => d.type === "bill")
                  .map((denom) => (
                    <Box
                      key={denom.value}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 16,
                          backgroundColor: denom.color,
                          border: "1px solid #333",
                          borderRadius: 0.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "7px",
                          fontWeight: "bold",
                          color: "#333",
                          flexShrink: 0,
                        }}
                      >
                        {denom.value}€
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ minWidth: 70, flexShrink: 0 }}
                      >
                        {denom.label}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateCount(denom.value, -1)}
                        disabled={!counts[denom.value]}
                        sx={{ p: 0.5, flexShrink: 0 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>
                      <TextField
                        size="small"
                        value={counts[denom.value] || 0}
                        onChange={(e) => setCount(denom.value, e.target.value)}
                        type="number"
                        slotProps={{
                          htmlInput: {
                            style: { textAlign: "center", width: 50 },
                            min: 0,
                          },
                        }}
                        sx={{ "& .MuiInputBase-root": { height: 28 }, flexShrink: 0 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => updateCount(denom.value, 1)}
                        sx={{ p: 0.5, flexShrink: 0 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          minWidth: 70,
                          textAlign: "right",
                          ml: "auto",
                          fontWeight: "medium",
                        }}
                      >
                        {formatCurrency((counts[denom.value] || 0) * denom.value)}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="caption" fontWeight="bold">
                  Total billets:
                </Typography>
                <Typography variant="caption" fontWeight="bold" color="success.main">
                  {formatCurrency(billsTotal)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
