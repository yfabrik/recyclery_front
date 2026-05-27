import { Print, Undo, Visibility } from "@mui/icons-material";
import {
  Box,
  Chip,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import type { TransactionModel } from "../interfaces/Models";
import { formatCurrency, getPaymentMethodLabel } from "../services/cartService";
interface TransactionTableLineProps {
  transaction: TransactionModel;
  handleReprintReceipt: (id: number) => void;
  handleRefund?: (t: TransactionModel) => void;
  handleShowDetail: (t: TransactionModel) => void;
}
export const TransactionTableLine = ({
  transaction,
  handleReprintReceipt,
  handleRefund,
  handleShowDetail,
}: TransactionTableLineProps) => {
  return (
    <TableRow key={transaction.id}>
      <TableCell>
        <Typography variant="body2" fontWeight="bold">
          {transaction.id}
        </Typography>
      </TableCell>
      <TableCell>
        {new Date(transaction.createdAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </TableCell>
      <TableCell>
        {transaction?.CashSession?.CashRegister?.Recyclery.name || "N/A"}
      </TableCell>
      <TableCell>{transaction?.CashSession?.User?.username || "N/A"}</TableCell>
      <TableCell>
        <Chip
          label={getPaymentMethodLabel(transaction.payment_method)}
          size="small"
          color={transaction.payment_method === "cash" ? "success" : "primary"}
        />
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {formatCurrency(transaction.total_amount)}
        </Typography>
      </TableCell>
      <TableCell>
        <RefundInfos transaction={transaction} />
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Voir les détails">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleShowDetail(transaction)}
            >
              <Visibility />
            </IconButton>
          </Tooltip>

          {/* <Tooltip title="Créer un avoir">
            <IconButton
              size="small"
              color="warning"
              onClick={() => handleCreditNote(transaction)}
            >
              <Receipt />
            </IconButton>
          </Tooltip> */}

          <Tooltip title="Réimprimer le ticket">
            <IconButton
              size="small"
              color="info"
              onClick={() => handleReprintReceipt(transaction.id)}
            >
              <Print />
            </IconButton>
          </Tooltip>

          {handleRefund && transaction.transactionType === "sell" && (

            <Tooltip title="Remboursement">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRefund(transaction)}
              >
                <Undo />
              </IconButton>
            </Tooltip>)}
        </Box>
      </TableCell>
    </TableRow>
  );
};

interface RefundInfosProps {
  transaction: TransactionModel;
}
const RefundInfos = ({ transaction }: RefundInfosProps) => {
  if (!transaction.refunds || transaction.refunds.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary">
        Aucun
      </Typography>
    );
  }

  const totalRefunded = transaction.refunds.reduce(
    (sum, refund) => sum + refund.total_amount,
    0,
  );
  const isFullRefund = transaction.total_amount - totalRefunded === 0;
  const hasGiftCard = transaction.refunds?.some(
    (r) => r.payment_method === "giftcard",
  );
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 0.5,
      }}
    >
      <Typography variant="body2" color="error" fontWeight="bold">
        -{formatCurrency(totalRefunded)}
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          flexWrap: "wrap",
        }}
      ></Box>
      {isFullRefund ? (
        <Chip label="Remboursé" size="small" color="error" variant="filled" />
      ) : (
        <Chip
          label={"partial"}
          size="small"
          color={"warning"}
          variant="outlined"
        />
      )}
      {hasGiftCard && (
        <Chip label="Avoir" size="small" color="info" variant="filled" />
      )}
    </Box>
  );
};
