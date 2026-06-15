import { Close, Euro, Payment, QrCodeScanner } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type {
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from "react-hook-form";
import { useFormContext, useWatch } from "react-hook-form";
import type { CartFormValues, Schema as CartSchema } from "../forms/cartSchema";
import { FormInput, FormSelect } from "../forms/FormBase";
import {
  formatCurrency,
  getCartTotalWithGlobalPromotion,
  getPaymentBalance,
  isPaymentInsufficient,
} from "../../services/cartService";

interface PaymentPanelProps {
  paymentFields: FieldArrayWithId<CartFormValues, "payment_splits", "id">[];
  appendPayment: UseFieldArrayAppend<CartFormValues, "payment_splits">;
  removePayment: UseFieldArrayRemove;
  giftCardScanInput: string;
  setGiftCardScanInput: (value: string) => void;
  onScanGiftCard: () => void;
}

export const PaymentPanel = ({
  paymentFields,
  appendPayment,
  removePayment,
  giftCardScanInput,
  setGiftCardScanInput,
  onScanGiftCard,
}: PaymentPanelProps) => {
  const { control, setValue } = useFormContext<CartFormValues, unknown, CartSchema>();

  const cart = useWatch({ control, name: "cart", defaultValue: [] }) as CartSchema["cart"];
  const paymentSplits = useWatch({
    control,
    name: "payment_splits",
    defaultValue: [{ method: "cash", amount: 0 }],
  }) as CartSchema["payment_splits"];
  const globalPromotion = useWatch({
    control,
    name: "global_promotion",
    defaultValue: { type: "percent", value: 0 },
  }) as CartSchema["global_promotion"];

  const cartTotal = getCartTotalWithGlobalPromotion(cart, globalPromotion);
  const totalPaid = paymentSplits.reduce(
    (sum, split) => sum + (Number(split.amount) || 0),
    0,
  );
  const paymentBalance = getPaymentBalance(totalPaid, cartTotal);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Gift Card / Avoir
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Scanner ou saisir le code-barres de l'avoir..."
              value={giftCardScanInput}
              onChange={(e) => setGiftCardScanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onScanGiftCard()}
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
              size="small"
              type="button"
              onClick={onScanGiftCard}
              sx={{ minWidth: 96 }}
              disabled={giftCardScanInput.trim().length < 1}
            >
              Scanner
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle2">Paiements</Typography>
          </Box>
        </Grid>

        {paymentFields.map((payment, index) => (
          <Grid key={payment.id} size={{ xs: 12 }}>
            {paymentSplits[index]?.method === "giftcard" && (
              <Box sx={{ mb: 1 }}>
                <Chip
                  size="small"
                  color="secondary"
                  label={`Avoir: ${paymentSplits[index]?.gift_card_barcode ?? "N/A"} - ${formatCurrency(Number(paymentSplits[index]?.gift_card_current_value || 0))}`}
                />
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-start",
              }}
            >
              <Box sx={{ width: "42%" }}>
                <FormSelect
                  label={`Mode de paiement #${index + 1}`}
                  control={control}
                  name={`payment_splits.${index}.method`}
                  extraSelect={{
                    size: "small",
                    disabled: paymentSplits[index]?.method === "giftcard",
                  }}
                >
                  <MenuItem value="cash">Espèces</MenuItem>
                  <MenuItem value="card">Carte bancaire</MenuItem>
                  <MenuItem value="check">Chèque</MenuItem>
                  <MenuItem value="transfer">Virement</MenuItem>
                  <MenuItem value="giftcard" disabled>
                    Avoir
                  </MenuItem>
                </FormSelect>
              </Box>
              <Box sx={{ width: "42%" }}>
                <FormInput
                  label="Montant (€)"
                  control={control}
                  name={`payment_splits.${index}.amount`}
                  extra={{
                    type: "number",
                    size: "small",
                    disabled: paymentSplits[index]?.method === "giftcard",
                    slotProps: {
                      input: {
                        startAdornment: (
                          <Euro sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      },
                    },
                  }}
                />
              </Box>
              <IconButton
                color="error"
                onClick={() => removePayment(index)}
                disabled={paymentFields.length <= 1}
                sx={{ mt: 0.5 }}
                size="small"
              >
                <Close />
              </IconButton>
            </Box>
          </Grid>
        ))}
        <Grid size={{ xs: 12 }}>
          <Button
            variant="outlined"
            size="small"
            type="button"
            onClick={() =>
              appendPayment({
                method: "cash",
                amount: 0,
                gift_card_barcode: undefined,
                gift_card_id: undefined,
              })
            }
          >
            + payment
          </Button>
        </Grid>
        <Grid size={{ xs: 10 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Promotion globale panier
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Box
              sx={{
                width: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                }}
              >
                <Typography variant="body2">% </Typography>
                <Switch
                  checked={globalPromotion.type === "fixed"}
                  onChange={(_, checked) =>
                    setValue(
                      "global_promotion.type",
                      checked ? "fixed" : "percent",
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                  size="small"
                />
                <Typography variant="body2">€</Typography>
              </Box>
            </Box>
            <Box sx={{ width: "50%" }}>
              <FormInput
                label="Valeur"
                control={control}
                name="global_promotion.value"
                extra={{
                  type: "number",
                  size: "small",
                }}
              />
            </Box>
          </Box>
        </Grid>
        {paymentBalance.change > 0 && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              Rendu à donner: {formatCurrency(paymentBalance.change)}
            </Alert>
          </Grid>
        )}
        {paymentBalance.remaining > 0 && cart.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="warning">
              Reste à payer: {formatCurrency(paymentBalance.remaining)}
            </Alert>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Total payé: {formatCurrency(paymentBalance.paid)} /{" "}
            {formatCurrency(paymentBalance.due)}
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={control}
            label="Code Postal"
            name="customer_postal_code"
          />
        </Grid>
        <Grid size={{ xs: 12 }}></Grid>
      </Grid>
      <Button
        fullWidth
        variant="contained"
        size="large"
        startIcon={<Payment />}
        type="submit"
        disabled={
          cart.length === 0 || isPaymentInsufficient(totalPaid, cartTotal)
        }
        sx={{ mb: 2 }}
      >
        Encaisser
      </Button>
    </Paper>
  );
};
