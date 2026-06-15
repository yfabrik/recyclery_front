import {
  Alert,
  Box,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import type { TransactionModel } from "../../interfaces/Models";
import { Loading } from "../Loading";
import { TransactionTableLine } from "../TransactionTableLine";

interface TransactionListTableProps {
  transactions: TransactionModel[];
  isLoading: boolean;
  emptyMessage: string;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  handleReprintReceipt: (id: number) => void;
  handleShowDetail: (transaction: TransactionModel) => void;
  handleRefund?: (transaction: TransactionModel) => void;
}

export const TransactionListTable = ({
  transactions,
  isLoading,
  emptyMessage,
  page,
  total,
  onPageChange,
  handleReprintReceipt,
  handleShowDetail,
  handleRefund,
}: TransactionListTableProps) => (
  <Loading isLoading={isLoading}>
    {transactions.length === 0 ? (
      <Alert severity="info">{emptyMessage}</Alert>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>N° Transaction</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Magasin</TableCell>
              <TableCell>Caissier</TableCell>
              <TableCell>Mode de paiement</TableCell>
              <TableCell align="right">Montant</TableCell>
              <TableCell>Remboursements</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TransactionTableLine
                key={transaction.id}
                transaction={transaction}
                handleRefund={handleRefund}
                handleReprintReceipt={handleReprintReceipt}
                handleShowDetail={handleShowDetail}
              />
            ))}
          </TableBody>
        </Table>
        <Box sx={{ display: "flex", justifyContent: "center", padding: 1 }}>
          <Pagination
            count={Math.trunc(total / 50) + 1 || 1}
            color="primary"
            page={page}
            onChange={(_e, val) => onPageChange(val)}
          />
        </Box>
      </TableContainer>
    )}
  </Loading>
);
