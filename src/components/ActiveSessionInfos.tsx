import { Close, PointOfSale } from "@mui/icons-material"
import { Box, Button, Grid, Paper, Typography } from "@mui/material"
import type { CashSession } from "../interfaces/Models"
import { formatCurrency } from "../services/cartService"

interface ActiveSessionInfosProps {
    activeSession: CashSession
    setCloseSessionDialog: (b: boolean) => void
}

export const ActiveSessionInfos = ({ activeSession, setCloseSessionDialog }: ActiveSessionInfosProps) => {
    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <PointOfSale color="primary" />
                        <Box>
                            <Typography variant="h6">
                                {activeSession.Recyclery?.name} -{" "}
                                {activeSession.CashRegister?.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Session: {activeSession.id} | Ouvert:{" "}
                                {new Date(activeSession.createdAt).toLocaleString()} | Fonds de caisse: {formatCurrency(activeSession.opening_amount)}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Close />}
                        onClick={() => setCloseSessionDialog(true)}
                    >
                        Fermer la Caisse
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    )
}