import { Add, Cancel, CardGiftcard, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import {
  createGiftCard,
  listGiftCards,
  type GiftCardDto,
  type CreateGiftCardRequestBody,
} from "../services/api/giftCards";
import { formatCurrency } from "../services/cartService";
import { Loading } from "../components/Loading";

type CreateGiftCardForm = {
  initial_value: string;
  expires_at: string;
  note: string;
  recipient_name: string;
  recipient_email: string;
};

const emptyForm: CreateGiftCardForm = {
  initial_value: "",
  expires_at: "",
  note: "",
  recipient_name: "",
  recipient_email: "",
};

const GiftCard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateGiftCardForm>(emptyForm);
  const queryClient = useQueryClient();

  const giftCards = useQuery({
    queryKey: ["giftCards"],
    queryFn: async () => {
      const response = await listGiftCards();
      if (!response.data.success) throw new Error(response.data.message);
      return response.data.data;
    },
  });

  const addGiftCard = useMutation({
    mutationFn: (payload: CreateGiftCardRequestBody) => createGiftCard(payload),
    onSuccess: (response) => {
      toast.success(getApiSuccessMessage(response, "Avoir créé avec succès"));
      setIsCreateDialogOpen(false);
      setCreateForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["giftCards"] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Erreur lors de la création de l'avoir"));
    },
  });

  const handleCreateGiftCard = () => {
    const initialValue = Number(createForm.initial_value);
    if (!Number.isFinite(initialValue) || initialValue <= 0) {
      toast.error("Le montant initial doit être supérieur à 0");
      return;
    }

    // Code généré côté frontend pour éviter de demander à l'utilisateur de le saisir.
    // Le backend peut toujours décider de le remplacer/valider selon ses règles.
    const generatedCode = `GC-${Date.now().toString(36).toUpperCase()}`;

    addGiftCard.mutate({
      code: generatedCode,
      initial_value: initialValue,
      expires_at: createForm.expires_at || undefined,
      note: createForm.note || undefined,
      recipient_name: createForm.recipient_name || undefined,
      recipient_email: createForm.recipient_email || undefined,
    });
  };

  const getStatusColor = (status: GiftCardDto["status"]) => {
    if (status === "active" || status === "partially_used") return "success";
    if (status === "redeemed") return "info";
    if (status === "cancelled") return "error";
    return "warning";
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          <CardGiftcard /> Gestion des Avoirs
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Nouvel Avoir
        </Button>
      </Box>

      <Loading isLoading={giftCards.isLoading}>
        {giftCards.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Impossible de charger la liste des avoirs.
          </Alert>
        )}

        {!giftCards.isError && (giftCards.data?.length ?? 0) === 0 && (
          <Alert severity="info">Aucun avoir trouvé.</Alert>
        )}

        <Grid container spacing={3}>
          {(giftCards.data ?? []).map((giftCard) => (
            <Grid key={giftCard.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {giftCard.code}
                    </Typography>
                    <Chip
                      size="small"
                      label={giftCard.status}
                      color={getStatusColor(giftCard.status)}
                    />
                  </Box>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {formatCurrency(Number(giftCard.initial_value || 0))}
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {formatCurrency(Number(giftCard.current_value || 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bénéficiaire: {giftCard.recipient_name || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {giftCard.recipient_email || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Expiration:{" "}
                    {giftCard.expires_at
                      ? new Date(giftCard.expires_at).toLocaleDateString("fr-FR")
                      : "Aucune"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Créé le {new Date(giftCard.createdAt).toLocaleDateString("fr-FR")}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Loading>

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nouvel Avoir</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
            <TextField
              label="Montant initial"
              type="number"
              value={createForm.initial_value}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, initial_value: e.target.value }))
              }
              required
            />
            <TextField
              label="Date d'expiration"
              type="date"
              value={createForm.expires_at}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, expires_at: e.target.value }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Nom du bénéficiaire"
              value={createForm.recipient_name}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  recipient_name: e.target.value,
                }))
              }
            />
            <TextField
              label="Email du bénéficiaire"
              type="email"
              value={createForm.recipient_email}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  recipient_email: e.target.value,
                }))
              }
            />
            <TextField
              label="Note"
              multiline
              minRows={2}
              value={createForm.note}
              onChange={(e) =>
                setCreateForm((prev) => ({ ...prev, note: e.target.value }))
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)} startIcon={<Cancel />}>
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleCreateGiftCard}
            loading={addGiftCard.isPending}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GiftCard;
