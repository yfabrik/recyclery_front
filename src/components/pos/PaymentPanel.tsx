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
import type { CartFormValues, CartFormOutput as CartSchema } from "../../services/schema/cart";
import { FormInput, FormSelect } from "../forms/FormBase";
import {
  formatCurrency,
  getCartTotalWithGlobalPromotion,
  getPaymentBalance,
  isPaymentInsufficient,
} from "../../services/cartService";
import { POS_PAYMENT_METHODS } from "../../constants/paymentMethods";

interface PaymentPanelProps {
  paymentFields: FieldArrayWithId<CartFormValues, "payment_splits", "id">[];
  appendPayment: UseFieldArrayAppend<CartFormValues, "payment_splits">;
  removePayment: UseFieldArrayRemove;
  giftCardScanInput: string;
  setGiftCardScanInput: (value: string) => void;
  onScanGiftCard: () => void;
  readOnly?: boolean;
  showSubmitButton?: boolean;
}

export const PaymentPanel = ({
  paymentFields,
  appendPayment,
  removePayment,
  giftCardScanInput,
  setGiftCardScanInput,
  onScanGiftCard,
  readOnly = false,
  showSubmitButton = true,
}: PaymentPanelProps) => {
  const { control, setValue } = useFormContext<CartFormValues, unknown, CartSchema>();

  // Omit useWatch defaultValue: before mount RHF prefers it over form defaultValues.
  const cart = useWatch({ control, name: "cart" }) as CartSchema["cart"] | undefined;
  const paymentSplits = useWatch({
    control,
    name: "payment_splits",
  }) as CartSchema["payment_splits"] | undefined;
  const globalPromotion = useWatch({
    control,
    name: "global_promotion",
  }) as CartSchema["global_promotion"] | undefined;

  const safeCart = cart ?? [];
  const safePaymentSplits = paymentSplits ?? [];
  const safeGlobalPromotion = globalPromotion ?? { type: "percent" as const, value: 0 };

  const cartTotal = getCartTotalWithGlobalPromotion(safeCart, safeGlobalPromotion);
  const totalPaid = safePaymentSplits.reduce(
    (sum, split) => sum + (Number(split.amount) || 0),
    0,
  );
  const paymentBalance = getPaymentBalance(totalPaid, cartTotal);

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {!readOnly && (
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
        )}

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
            {safePaymentSplits[index]?.method === "giftcard" && (
              <Box sx={{ mb: 1 }}>
                <Chip
                  size="small"
                  color="secondary"
                  label={`Avoir: ${safePaymentSplits[index]?.gift_card_barcode ?? "N/A"} - ${formatCurrency(Number(safePaymentSplits[index]?.gift_card_current_value || 0))}`}
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
                    disabled:
                      readOnly || safePaymentSplits[index]?.method === "giftcard",
                  }}
                >
                  {POS_PAYMENT_METHODS.map((method) => (
                    <MenuItem
                      key={method.value}
                      value={method.value}
                      disabled={method.value === "giftcard"}
                    >
                      {method.label}
                    </MenuItem>
                  ))}
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
                    disabled:
                      readOnly || safePaymentSplits[index]?.method === "giftcard",
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
              {!readOnly && (
                <IconButton
                  color="error"
                  onClick={() => removePayment(index)}
                  disabled={paymentFields.length <= 1}
                  sx={{ mt: 0.5 }}
                  size="small"
                >
                  <Close />
                </IconButton>
              )}
            </Box>
          </Grid>
        ))}
        {!readOnly && (
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
        )}
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
                  checked={safeGlobalPromotion.type === "fixed"}
                  disabled={readOnly}
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
                  disabled: readOnly,
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
        {paymentBalance.remaining > 0 && safeCart.length > 0 && (
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
            extra={{ disabled: readOnly }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}></Grid>
      </Grid>
      {!readOnly && showSubmitButton && (
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<Payment />}
          type="submit"
          disabled={
            safeCart.length === 0 || isPaymentInsufficient(totalPaid, cartTotal)
          }
          sx={{ mb: 2 }}
        >
          Encaisser
        </Button>
      )}
    </Paper>
  );
};
