import { CardGiftcard } from "@mui/icons-material";
import {
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { GiftCardSummaryDto } from "@recyclerie/api/responses/salesTransactions";
import type { TransactionModel } from "../../interfaces/Models";
import {
  getGiftCardStatusColor,
  getGiftCardStatusLabel,
} from "../../constants/giftCardStatuses";
import { formatCurrency } from "../../services/cartService";

interface IssuedGiftCardsCardProps {
  transaction: TransactionModel;
}

export const IssuedGiftCardsCard = ({
  transaction,
}: IssuedGiftCardsCardProps) => {
  const giftCards: GiftCardSummaryDto[] = transaction.giftCards ?? [];

  if (giftCards.length === 0) {
    return null;
  }

  return (
    <Card variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight="bold">
        <CardGiftcard sx={{ verticalAlign: "middle", mr: 0.5 }} />
        Avoir émis
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Solde</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {giftCards.map((giftCard) => (
              <TableRow key={giftCard.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {giftCard.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {giftCard.currentBalance != null
                      ? formatCurrency(Number(giftCard.currentBalance))
                      : "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getGiftCardStatusLabel(giftCard.status)}
                    color={getGiftCardStatusColor(giftCard.status)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};
