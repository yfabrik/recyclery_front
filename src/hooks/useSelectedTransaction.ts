import { useQuery } from "@tanstack/react-query";
import { getTransactionDetails } from "../services/api/transactions";

export const useSelectedTransaction = (
  transactionId: number | null,
  enabled = true,
) =>
  useQuery({
    queryKey: ["transactionDetails", transactionId],
    queryFn: () =>
      getTransactionDetails(transactionId!).then(
        (response) => response.data.data,
      ),
    enabled: enabled && transactionId != null,
  });
