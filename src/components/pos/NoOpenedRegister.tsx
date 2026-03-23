import { AccountBalance } from "@mui/icons-material"
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Typography } from "@mui/material"
import { OpenCaisseForm, type Schema as OpenCaisseSchema } from "../forms/OpenCaisseForm"

interface NoOpenedRegisterProps {
    setOpenSessionDialog: React.Dispatch<React.SetStateAction<boolean>>
    openSessionDialog: boolean;
    handleOpenSession: (data: OpenCaisseSchema) => void;
}
export const NoOpenedRegister = ({ setOpenSessionDialog, openSessionDialog, handleOpenSession }: NoOpenedRegisterProps) => {
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 4, textAlign: "center" }}>
                <AccountBalance sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                    Point de Vente
                </Typography>
                <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    Aucune session de caisse active. Ouvrez une caisse pour commencer
                    les ventes.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<AccountBalance />}
                    onClick={() => setOpenSessionDialog(true)}
                >
                    Ouvrir une Caisse
                </Button>
            </Paper>
            {/* Dialog d'ouverture de session */}
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenSessionDialog(false)}>Annuler</Button>
                    <Button type="submit" form="OpenCaisseForm" variant="contained">
                        Ouvrir la Caisse
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}