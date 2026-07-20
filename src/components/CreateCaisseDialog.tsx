import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useQueryErrorToast } from "../hooks/useQueryErrorToast";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { createCaisse, fetchCaisses } from "../services/api/store";
import type { StoreModel } from "../interfaces/Models";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  CreateCaisseForm,
  type Schema as CaisseSchema,
  type Schema,
} from "./forms/CreateCaisseForm";
import { useState } from "react";

interface CreateCaisseDialogProps {
  store: StoreModel;
  open: boolean;
  onClose:
    | ((
        event:
          | React.MouseEvent<HTMLButtonElement>
          | React.KeyboardEvent<HTMLButtonElement>
          | React.MouseEvent<HTMLAnchorElement>
          | React.KeyboardEvent<HTMLAnchorElement>,
        reason: "backdropClick" | "escapeKeyDown",
      ) => void)
    | undefined;
}
export const CreateCaisseDialog = ({
  store,
  open,
  onClose,
}: CreateCaisseDialogProps) => {
  const queryClient = useQueryClient();
  const caisses = useQuery({
    queryKey: ["caisses", store.id],
    queryFn: () =>
      fetchCaisses(store.id).then((response) => response.data.data),
    placeholderData: [],
  });
  useQueryErrorToast(caisses.error, "Erreur lors du chargement des caisses");

  const [formMethods, setFormMethods] = useState<{
    reset: (values?: Schema) => void;
  } | null>(null);

  const addCaisse = useMutation({
    mutationFn: ({ id, name }: { id: number; name: CaisseSchema }) =>
      createCaisse(id, name),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Caisse créée avec succès"));
      queryClient.invalidateQueries({ queryKey: ["caisses"] });
      formMethods?.reset();
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la création de la caisse")),
  });

  const handleAddCashRegister = async (data: CaisseSchema) => {
    addCaisse.mutate({ id: store.id, name: data });
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Caisses - {store.name}</DialogTitle>
      <DialogContent>
        <CreateCaisseForm
          formId="createCaisse"
          onSubmit={handleAddCashRegister}
          onReady={setFormMethods}
        />

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Sessions</TableCell>
                <TableCell>Dernière utilisation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {caisses.isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : caisses.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Aucune caisse
                  </TableCell>
                </TableRow>
              ) : (
                caisses.data?.map((register) => (
                  <TableRow key={register.id}>
                    <TableCell>{register.name}</TableCell>
                    <TableCell>{register.total_sessions || 0}</TableCell>
                    <TableCell>
                      {register.last_session
                        ? new Date(register.last_session).toLocaleString()
                        : "Jamais"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={(e) =>
            onClose?.(e as React.MouseEvent<HTMLButtonElement>, "backdropClick")
          }
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
