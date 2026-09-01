import { useEffect } from "react";
import { toast } from "react-toastify";

import { getApiErrorMessage } from "../utils/apiToastMessage";
//TODO move to queryclient cache ?
export const useQueryErrorToast = (error: unknown, fallback: string) => {
  useEffect(() => {
    if (!error) return;
    toast.error(getApiErrorMessage(error, fallback));
  }, [error, fallback]);
};
