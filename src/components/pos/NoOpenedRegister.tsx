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
import {
    getApiErrorMessage,
    getApiSuccessMessage,
} from "../../utils/apiToastMessage";
import type { CaisseModel, CashSession, StoreModel } from "../../interfaces/Models";
import { fetchStores, fetchCaisses, getCaisseDetails, getSessionDetails, OpenCaisse } from "../../services/api/store";
import { formatCurrency } from "../../services/cartService";
import {
    getCashSessionStatusColor,
    getCashSessionStatusLabel,
} from "../../constants/cashSessionStatuses";
import { useBilanCaissePrint } from "../BilanCaissePrint";
import { OpenCaisseForm, type OpenCaisseFormValues } from "../forms/OpenCaisseForm";
import { Loading } from "../Loading";
import { openCaissePayloadFromForm } from "../../services/mapper/caisse";
import type { OpenCaisseFormOutput } from "../../services/schema/caisse";

export const NoOpenedRegister = () => {
    const [openSessionDialog, setOpenSessionDialog] = useState(false)
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
    const [historyRegister, setHistoryRegister] = useState<CaisseModel | null>(null);
    const [formDefaults, setFormDefaults] = useState<Partial<OpenCaisseFormValues> | null>(null)

    const queryClient = useQueryClient()
    const stores = useQuery({
        queryKey: ["stores", { active: true, include: ["caisses"] }],
        queryFn: () => fetchStores({ active: true, include: ["caisses"] }).then((response) => response.data.data),
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
        mutationFn: (data: OpenCaisseFormOutput) =>
            OpenCaisse(openCaissePayloadFromForm(data)),
        onSuccess: (data) => {
            toast.success(getApiSuccessMessage(data, "Session ouverte avec succès"));
            setOpenSessionDialog(false);
            queryClient.invalidateQueries({ queryKey: ["activeSession"] });
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Erreur lors de l'ouverture"));
        },
    });

    const handleOpenSession = (data: OpenCaisseFormOutput) => {
        openSession.mutate(data);
    };

    const handleOpenClick = (storeId: number, cashRegisterId: number) => {
        setFormDefaults({
            store_id: storeId,
            cash_register_id: cashRegisterId,
        })
        setOpenSessionDialog(true);
    };
    const handleCloseDialogSession = () => {
        setOpenSessionDialog(false);
        setFormDefaults(null)
    }

    const handleShowHistory = (register: CaisseModel) => {
        setHistoryRegister(register);
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
                onClose={handleCloseDialogSession}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Ouverture de Caisse</DialogTitle>
                <DialogContent>
                    {openSessionDialog && (
                        <OpenCaisseForm
                            key={`${formDefaults?.store_id ?? ""}-${formDefaults?.cash_register_id ?? ""}`}
                            formId="OpenCaisseForm"
                            onSubmit={handleOpenSession}
                            stores={availableStores}
                            defaultValues={formDefaults}

                        // lockStoreAndRegister={formDefaults?.cash_register_id !== null && formDefaults?.store_id !== null}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleCloseDialogSession}
                    >
                        Annuler
                    </Button>
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
    // Nested store.caisses are refs only; session counts live on the cash-register list DTO.
    const caisses = useQuery({
        queryKey: ["caisses", store.id],
        queryFn: () =>
            fetchCaisses(store.id).then((response) => response.data.data),
    });

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
                <Loading isLoading={caisses.isLoading}>
                    {!caisses.data?.length ? (
                        <Typography variant="body2" color="text.secondary">
                            Aucune caisse configurée pour ce magasin.
                        </Typography>
                    ) : (
                        <List dense disablePadding>
                            {caisses.data.map((register) => (
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
                                        secondary={`Sessions: ${register.total_sessions ?? 0}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Loading>
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
        queryFn: () => getCaisseDetails(register.id).then((response) => response.data.data),
        enabled: !!register.id,
    });

    const handleReprintSummary = async (session: CashSession) => {
        try {
            setIsPrinting(true);
            const detail = await getSessionDetails(session.id).then((response) => response.data.data);
            triggerPrintBilanCaisse({
                session: detail,
                transactions: (detail.SalesTransactions ?? []).map(
                    (transaction) => ({
                        ...transaction,
                        payments: transaction.payments ?? [],
                    }),
                ),
                closingAmount: detail.closing_amount ?? 0,
            });
            toast.info(`Reimpression du bilan de la session #${session.id}`);
        } catch (error) {
            toast.error(getApiErrorMessage(error, `Impossible de reimprimer la session #${session.id}`));
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
                    {!sessions.data?.sessions?.length ? (
                        <Typography variant="body2" color="text.secondary">
                            Aucune session trouvée pour cette caisse.
                        </Typography>
                    ) : (
                        <List dense>
                            {sessions.data?.sessions?.map((session) => (
                                <ListItem key={session.id} divider>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <span>{`Session #${session.id} - ${session.createdAt
                                                        ? new Date(session.createdAt).toLocaleString("fr-FR")
                                                        : "—"
                                                    } -> ${session.closed_at ? new Date(session.closed_at).toLocaleString("fr-FR") : "Pas fermée"}`}</span>
                                                <Chip
                                                    size="small"
                                                    label={getCashSessionStatusLabel(session.status)}
                                                    color={getCashSessionStatusColor(session.status)}
                                                />
                                            </Box>
                                        }
                                        secondary={`Ouverture: ${formatCurrency(session.opening_amount)} | Fermeture: ${session.closing_amount != null
                                                ? formatCurrency(session.closing_amount)
                                                : "—"
                                            }`}
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