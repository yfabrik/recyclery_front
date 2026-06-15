import { Box, Divider, Paper, Typography } from "@mui/material";
import type { Schema as CartSchema } from "../forms/cartSchema";
import { formatCurrency, formatWeight } from "../../services/cartService";

interface OrderSummaryProps {
  cart: CartSchema["cart"];
  cartSubtotal: number;
  globalPromotionDiscount: number;
  paymentBalance: { due: number };
}

export const OrderSummary = ({
  cart,
  cartSubtotal,
  globalPromotionDiscount,
  paymentBalance,
}: OrderSummaryProps) => (
  <Paper sx={{ p: 2, top: 20 }}>
    <Typography variant="h6" gutterBottom>
      Résumé de la Commande
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 1,
      }}
    >
      <Typography>Types d'articles:</Typography>
      <Typography>{cart.length}</Typography>
    </Box>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 1,
      }}
    >
      <Typography>Total d'articles:</Typography>
      <Typography>
        {cart.reduce((prev, current) => (prev += current.quantity), 0)}
      </Typography>
    </Box>
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 1,
      }}
    >
      <Typography>Poids</Typography>
      <Typography>
        {formatWeight(
          cart.reduce(
            (prev, current) => (prev += current.weight * current.quantity),
            0,
          ),
        )}
      </Typography>
    </Box>

    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Typography>Sous-total:</Typography>
      <Typography>{formatCurrency(cartSubtotal)}</Typography>
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
      <Typography>Promotion globale:</Typography>
      <Typography
        color={globalPromotionDiscount > 0 ? "success.main" : "text.primary"}
      >
        -{formatCurrency(globalPromotionDiscount)}
      </Typography>
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Total à payer:
      </Typography>
      <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
        {formatCurrency(paymentBalance.due)}
      </Typography>
    </Box>
  </Paper>
);
