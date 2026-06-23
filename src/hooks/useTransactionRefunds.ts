import { useQuery } from "@tanstack/react-query";
import { getRefundForTransaction } from "../services/api/transactions";

export const useTransactionRefunds = (transactionId: number) => {
  const refundsQuery = useQuery({
    queryKey: ["refunds", { id: transactionId }],
    queryFn: () =>
      getRefundForTransaction(transactionId).then((response) => response.data.refunds),
    placeholderData: [],
  });

  const refunds = refundsQuery.data ?? [];
  const totalRefunded = refunds.reduce((sum, refund) => sum + refund.total_amount, 0);

  return { refundsQuery, refunds, totalRefunded };
};
