import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "../../utils/apiToastMessage";
import { createTimeRangeWriteQueue } from "./timeRangeWriteQueue";

/**
 * The write machinery shared by the dialogs that edit Time ranges with local state first
 * (`TaskAssignmentDialog`, `EmployeeDayDialog`): one serial `TimeRangeWriteQueue` per
 * dialog instance, flushed when the dialog unmounts, and `runWrite`, which reverts the
 * dialog to the server's state and toasts the error when a write is refused.
 *
 * What "the server's state" is, and how local state is seeded from it, belongs to the
 * dialog: it passes `revertToServer`, which this hook always calls at its latest version.
 */
export function useRevertingWriteQueue(revertToServer: () => Promise<void>) {
  // Always the latest `revertToServer`, whichever render the queued write was requested in.
  const [latest] = useState(() => ({ revertToServer }));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- a "latest value" holder read by queued writes
    latest.revertToServer = revertToServer;
  });

  /** Set on every local change; the dialog reads it on close to decide whether to refresh the page. */
  const hasChangesRef = useRef(false);

  const [writeQueue] = useState(() =>
    createTimeRangeWriteQueue((error) => {
      void latest.revertToServer();
      toast.error(getApiErrorMessage(error, "Erreur lors de l'enregistrement"));
    }),
  );

  useEffect(
    () => () => {
      void writeQueue.flush();
    },
    [writeQueue],
  );

  /** Runs a write; on rejection, reverts local state to the server's and toasts the error. */
  const runWrite = useCallback(
    async <T,>(write: () => Promise<T>, errorMessage: string, onSuccess?: (result: T) => void) => {
      try {
        const result = await write();
        onSuccess?.(result);
      } catch (error) {
        await latest.revertToServer();
        toast.error(getApiErrorMessage(error, errorMessage));
      }
    },
    [latest],
  );

  return { writeQueue, runWrite, hasChangesRef };
}
