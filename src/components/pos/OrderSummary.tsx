import { Box, Divider, Paper, Typography } from "@mui/material";
import type { CartFormOutput as CartSchema } from "../../services/schema/cart";
import { formatCurrency, formatWeight } from "../../services/cartService";

interface OrderSummaryProps {
  cart: CartSchema["cart"];
  cartSubtotal: number;
  globalPromotionDiscount: number;
  paymentBalance: { due: number };
  globalPromotion?: CartSchema["global_promotion"];
}

const SummaryRow = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      mb: 1,
    }}
  >
    <Typography variant="body2" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="h6" color={valueColor}>
      {value}
    </Typography>
  </Box>
);

export const OrderSummary = ({
  cart,
  cartSubtotal,
  globalPromotionDiscount,
  paymentBalance,
  globalPromotion,
}: OrderSummaryProps) => {
  const promoLabel =
    globalPromotionDiscount > 0 && globalPromotion
      ? globalPromotion.type === "percent"
        ? ` (${globalPromotion.value}%)`
        : globalPromotion.type === "fixed"
          ? ` (${formatCurrency(globalPromotion.value)})`
          : ""
      : "";

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Résumé de la commande
      </Typography>

      <Divider sx={{ my: 2 }} />

      <SummaryRow label="Types d'articles" value={String(cart.length)} />
      <SummaryRow
        label="Total d'articles"
        value={String(
          cart.reduce((prev, current) => (prev += current.quantity), 0),
        )}
      />
      <SummaryRow
        label="Poids"
        value={formatWeight(
          cart.reduce(
            (prev, current) => (prev += current.weight * current.quantity),
            0,
          ),
        )}
      />
      <SummaryRow label="Sous-total" value={formatCurrency(cartSubtotal)} />
      <SummaryRow
        label={`Promotion globale${promoLabel}`}
        value={`-${formatCurrency(globalPromotionDiscount)}`}
        valueColor={
          globalPromotionDiscount > 0 ? "success.main" : "text.primary"
        }
      />

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Total à payer
        </Typography>
        <Typography variant="h5" color="primary" fontWeight={700}>
          {formatCurrency(paymentBalance.due)}
        </Typography>
      </Box>
    </Paper>
  );
};
