import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createCaisse, fetchCaisses } from "../services/api/store";
import type { StoreModel } from "../interfaces/Models";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { CreateCaisseForm, type Schema as CaisseSchema } from "./forms/CreateCaisseForm";

interface CreateCaisseDialogProps {
    store: StoreModel
    open: boolean
    onClose: ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined
}
export const CreateCaisseDialog = ({ store, open, onClose }: CreateCaisseDialogProps) => {

    const queryClient = useQueryClient()
    const caisses = useQuery({
        queryKey: ["caisses", store.id],
        queryFn: () => fetchCaisses(store.id).then(response => response.data.cash_registers),
        placeholderData: []
    })
    if (caisses.isError) toast.error("Erreur lors du chargement des caisses");


    const addCaisse = useMutation({
        mutationFn: ({ id, name }: { id: number, name: CaisseSchema }) => createCaisse(id, name),
        onSuccess: () => {
            toast.success("Caisse créée avec succès")
            queryClient.invalidateQueries({ queryKey: ["caisses"] })
        },
        onError: () => toast.error("Erreur lors de la création de la caisse"),
    })

    const handleAddCashRegister = async (data: CaisseSchema) => {
        addCaisse.mutate({ id: store.id, name: data })

    };

    return (
        <Dialog
            open={open}
            onClose={onclose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Caisses - {store.name}</DialogTitle>
            <DialogContent>
                <CreateCaisseForm formId="createCaisse" onSubmit={handleAddCashRegister} />


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
                            {caisses.isLoading ?
                                (<Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                    <CircularProgress />
                                </Box>) :


                                caisses.data?.length === 0 ? (
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
                <Button onClick={onClose}>Fermer</Button>
            </DialogActions>
        </Dialog>
    )
}