import type { TransactionModel } from "../interfaces/Models";

export interface TransactionRowActions {
  /** Opens the details dialog in edit mode. Sales only. */
  canEdit: boolean;
  /** "annuler la transaction": Sales and Refunds of your open cash session. */
  canCancel: boolean;
  /** "Remboursement": Sales outside your open cash session. */
  canRefund: boolean;
}

/**
 * Which actions a row of the register's history offers. `currentCashSessionId`
 * is your open cash session; without it nothing can be edited or cancelled.
 */
export const getTransactionRowActions = (
  transaction: Pick<TransactionModel, "transactionType" | "cash_session_id">,
  currentCashSessionId?: number,
): TransactionRowActions => {
  const inCurrentSession =
    currentCashSessionId != null &&
    transaction.cash_session_id === currentCashSessionId;
  const isSale = transaction.transactionType === "sell";
  return {
    canEdit: isSale && inCurrentSession,
    canCancel: inCurrentSession,
    canRefund: isSale && !inCurrentSession,
  };
};
