import { AccountBalance, History, Print, Storefront } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { CaisseModel, CashSession, StoreModel } from "../../interfaces/Models";
import { fetchStores, getCaisseDetails, getSessionDetails, OpenCaisse } from "../../services/api/store";
import { useBilanCaissePrint } from "../BilanCaissePrint";
import { OpenCaisseForm, type Schema as OpenCaisseSchema } from "../forms/OpenCaisseForm";
import { Loading } from "../Loading";

export const NoOpenedRegister = () => {
    const [openSessionDialog, setOpenSessionDialog] = useState(false)
    const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);
    const [selectedCashRegisterId, setSelectedCashRegisterId] = useState<number | null>(null);
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyRegister, setHistoryRegister] = useState<CaisseModel | null>(null);

    const queryClient = useQueryClient()
    const stores = useQuery({
        queryKey: ["stores", { active: true, include: ["caisses"] }],
        queryFn: () => fetchStores({ active: true, include: ["caisses"] }).then((response) => response.data.stores),
        // enabled: !storesData,
    });

    const availableStores = useMemo(
        () =>
            //  storesData ??
            stores.data ?? [],
        [
            stores.data,
            //  storesData
        ]
    );

    const openSession = useMutation({
        mutationFn: (data: OpenCaisseSchema) => OpenCaisse(data),
        onSuccess: () => {
            toast.success("Session ouverte avec succès");
            setOpenSessionDialog(false);
            queryClient.invalidateQueries({ queryKey: ["activeSession"] });
        },
        onError: () => {
            toast.error("Erreur lors de l'ouverture");
        },
    });

    const handleOpenSession = (data: OpenCaisseSchema) => {
        openSession.mutate(data);
    };

    const handleOpenClick = (storeId: number, cashRegisterId: number) => {
        setSelectedStoreId(storeId);
        setSelectedCashRegisterId(cashRegisterId);
        setOpenSessionDialog(true);
    };

    const handleShowHistory = (register: CaisseModel) => {
        setHistoryRegister(register);
        // setHistorySessions(buildMockSessions(registerId));
        setHistoryDialogOpen(true);
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ mb: 3, textAlign: "center" }}>
                <AccountBalance sx={{ fontSize: 64, color: "primary.main", mb: 1 }} />
                <Typography variant="h4" gutterBottom>
                    Point de Vente
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    Aucune session de caisse active. Ouvrez une caisse depuis un magasin pour commencer les ventes.
                </Typography>
            </Box>
            <Loading isLoading={stores.isLoading}>
                {availableStores.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        Aucun magasin actif disponible.
                    </Typography>
                ) : (
                    <Grid container spacing={2}>
                        {availableStores.map((store) => (
                            <Grid size={{ xs: 12, md: 6 }} key={store.id}>
                                <StoreCard store={store} handleOpenClick={handleOpenClick} handleShowHistory={handleShowHistory} />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Loading>

            <Dialog
                open={openSessionDialog}
                onClose={() => setOpenSessionDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Ouverture de Caisse</DialogTitle>
                <DialogContent>
                    <OpenCaisseForm
                        formId="OpenCaisseForm"
                        onSubmit={handleOpenSession}
                        defaultStoreId={selectedStoreId ?? undefined}
                        defaultCashRegisterId={selectedCashRegisterId ?? undefined}
                        lockStoreAndRegister={selectedStoreId !== null && selectedCashRegisterId !== null}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSessionDialog(false)}>Annuler</Button>
                    <Button type="submit" form="OpenCaisseForm" variant="contained">
                        Ouvrir la Caisse
                    </Button>
                </DialogActions>
            </Dialog>
            {historyRegister && (
                <HistoryDialog
                    open={historyDialogOpen}
                    onClose={() => setHistoryDialogOpen(false)}
                    register={historyRegister}
                />)}
        </Container>
    );
};
interface StoreCardProps {
    store: StoreModel
    handleOpenClick: (storeId: number, caisseId: number) => void,
    handleShowHistory: (register: CaisseModel) => void,
}
const StoreCard = ({ store, handleOpenClick, handleShowHistory }: StoreCardProps) => {
    return (
        <Card>
            <CardHeader
                avatar={
                    <Avatar sx={{ bgcolor: store.is_active ? "primary.main" : "grey.500" }}>
                        <Storefront />
                    </Avatar>
                }
                title={store.name}
                subheader={store.address || "Adresse non renseignée"}
                action={
                    <Chip
                        label={store.is_active ? "Actif" : "Inactif"}
                        color={store.is_active ? "success" : "default"}
                        size="small"
                    />
                }
            />
            <Divider />
            <CardContent>
                {!store.caisses?.length ? (
                    <Typography variant="body2" color="text.secondary">
                        Aucune caisse configurée pour ce magasin.
                    </Typography>
                ) : (
                    <List dense disablePadding>
                        {store.caisses.map((register) => (
                            <ListItem
                                key={register.id}
                                sx={{ py: 1.2 }}
                                secondaryAction={
                                    <Box>
                                        <IconButton
                                            color="primary"
                                            title="Ouvrir une session"
                                            onClick={() => handleOpenClick(store.id, register.id)}
                                        >
                                            <AccountBalance />
                                        </IconButton>
                                        <IconButton
                                            color="info"
                                            title="Voir historique"
                                            onClick={() => handleShowHistory(register)}
                                        >
                                            <History />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemText
                                    primary={register.name}
                                    secondary={`Sessions: ${register.total_sessions || 0}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </CardContent>
        </Card >
    )

}

interface historyDialogProps {
    open: boolean;
    onClose: () => void;
    register: CaisseModel;
}
const HistoryDialog = ({ open, onClose, register }: historyDialogProps) => {
    const [isPrinting, setIsPrinting] = useState(false);
    const { triggerPrintBilanCaisse, bilanCaissePrintNode } = useBilanCaissePrint();
    const sessions = useQuery({
        queryKey: ["sessions", { registerId: register.id }],
        queryFn: () => getCaisseDetails(register.id).then((response) => response.data),
        enabled: !!register.id,
    });

    const handleReprintSummary = async (session: CashSession) => {
        try {
            setIsPrinting(true);
            const detail = await getSessionDetails(session.id).then((response) => response.data.session);
            triggerPrintBilanCaisse({
                session: detail,
                transactions: detail.SalesTransactions ?? [],
                closingAmount: detail.closing_amount ?? 0,
            });
            toast.info(`Reimpression du bilan de la session #${session.id}`);
        } catch {
            toast.error(`Impossible de reimprimer la session #${session.id}`);
        } finally {
            setIsPrinting(false);
        }
    };

    return (<>
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Historique des sessions - {register.name}</DialogTitle>
            <DialogContent>
                <Loading isLoading={sessions.isLoading}>
                    {sessions.data?.data.sessions.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            Aucune session trouvée pour cette caisse.
                        </Typography>
                    ) : (
                        <List dense>
                            {sessions.data?.data?.sessions?.map((session) => (
                                <ListItem key={session.id} divider>
                                    <ListItemText
                                        primary={`Session #${session.id} - ${new Date(session.createdAt).toLocaleString("fr-FR")} -> ${session.closed_at ? new Date(session.closed_at).toLocaleString("fr-FR") : "Pas fermée"}`}
                                        secondary={`Ouverture: ${session.opening_amount}€ | Fermeture: ${session.closing_amount ?? "-"}€`}
                                    />
                                    <Button
                                        size="small"
                                        startIcon={<Print />}
                                        disabled={isPrinting}
                                        onClick={() => handleReprintSummary(session)}
                                    >
                                        {isPrinting ? "Impression..." : "Réimprimer bilan"}
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Loading>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fermer</Button>
            </DialogActions>
        </Dialog>
        {bilanCaissePrintNode}
    </>
    )
}