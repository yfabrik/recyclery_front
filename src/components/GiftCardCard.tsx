import {
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from "@mui/material";
import type { GiftCardDto } from "@recyclerie/api/responses/giftCards";
import {
  getGiftCardStatusColor,
  getGiftCardStatusLabel,
} from "../constants/giftCardStatuses";
import { formatCurrency } from "../services/cartService";
import { Block, Print } from "@mui/icons-material";

interface GiftCardCardProps {
  giftCard: GiftCardDto;
  handlePrintGiftCard: (giftCard: GiftCardDto) => void;
  handleCancelGiftCard: (giftCard: GiftCardDto) => void;
}
export const GiftCardCard = ({
  giftCard,
  handlePrintGiftCard,
  handleCancelGiftCard,
}: GiftCardCardProps) => {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {giftCard.code}
          </Typography>
          <Chip
            size="small"
            label={getGiftCardStatusLabel(giftCard.status)}
            color={getGiftCardStatusColor(giftCard.status)}
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Montant initial:{" "}
          {formatCurrency(Number(giftCard.initial_value || 0))}
        </Typography>
        <Typography variant="h6" color="primary" fontWeight={700}>
          Solde: {formatCurrency(Number(giftCard.current_value || 0))}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Bénéficiaire: {giftCard.recipient_name || "N/A"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Email: {giftCard.recipient_email || "N/A"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Expiration:{" "}
          {giftCard.expires_at
            ? new Date(giftCard.expires_at).toLocaleDateString("fr-FR")
            : "Aucune"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Créé le{" "}
          {giftCard.createdAt
            ? new Date(giftCard.createdAt).toLocaleDateString("fr-FR")
            : "—"}
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton
          aria-label="Imprimer l'avoir"
          size="small"
          color="primary"
          onClick={()=>handlePrintGiftCard(giftCard)}
        >
          <Print />
        </IconButton>
        <IconButton
          aria-label="Annuler l'avoir"
          size="small"
          color="error"
          onClick={()=>handleCancelGiftCard(giftCard)}
        >
          <Block />
        </IconButton>
      </CardActions>
    </Card>
  );
};
