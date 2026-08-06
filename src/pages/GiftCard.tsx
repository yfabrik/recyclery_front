import { Add, Cancel, CardGiftcard, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { GiftCardCard } from "../components/GiftCardCard";
import { Loading } from "../components/Loading";
import { GiftCardForm } from "../components/forms/GiftCardForm";
import { createGiftCard, listGiftCards } from "../services/api/giftCards";
import { createGiftCardPayloadFromForm } from "../services/mapper/giftcard";
import { type CreateGiftCardFormOutput } from "../services/schema/giftcard";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import type { GiftCardDto } from "@recyclerie/api/responses/giftCards";
import { useGiftCardPrint } from "../components/pos/GiftCartPrint";

// type CreateGiftCardForm = {
//   initial_value: string;
//   expires_at: string;
//   note: string;
//   recipient_name: string;
//   recipient_email: string;
// };

// const emptyForm: CreateGiftCardForm = {
//   initial_value: "",
//   expires_at: "",
//   note: "",
//   recipient_name: "",
//   recipient_email: "",
// };

const GiftCard = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // const [createForm, setCreateForm] = useState<CreateGiftCardForm>(emptyForm);
  const queryClient = useQueryClient();
  const { triggerPrintGiftCard, giftCardPrintNode } = useGiftCardPrint();
  const giftCards = useQuery({
    queryKey: ["giftCards"],
    queryFn: () => listGiftCards().then((response) => response.data.data),
  });

  const addGiftCard = useMutation({
    mutationFn: (payload: CreateGiftCardFormOutput) =>
      createGiftCard(createGiftCardPayloadFromForm(payload)),
    onSuccess: (response) => {
      toast.success(getApiSuccessMessage(response, "Avoir créé avec succès"));
      setIsCreateDialogOpen(false);
      // setCreateForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: ["giftCards"] });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la création de l'avoir"),
      );
    },
  });
  const handlePrintGiftCard = (giftCard: GiftCardDto) => {
    console.log(giftCard);
    triggerPrintGiftCard({
      giftCard: {
        code: giftCard.code,
        initial_value: Number(giftCard.initial_value ?? 0),
        current_value: Number(giftCard.current_value ?? 0),
        createdAt: giftCard.createdAt ?? new Date().toISOString(),
      },
      storeAddress: undefined,
    });
  };

  const handleCreateGiftCard = (data: CreateGiftCardFormOutput) => {
    // const initialValue = Number(createForm.initial_value);
    // if (!Number.isFinite(initialValue) || initialValue <= 0) {
    //   toast.error("Le montant initial doit être supérieur à 0");
    //   return;
    // }

    // Code généré côté frontend pour éviter de demander à l'utilisateur de le saisir.
    // Le backend peut toujours décider de le remplacer/valider selon ses règles.
    // const generatedCode = `GC-${Date.now().toString(36).toUpperCase()}`;

    // addGiftCard.mutate({
    //   // code: generatedCode,
    //   initial_value: data.initial_value,
    //   expires_at: data.expires_at,
    //   note: data.note,
    //   recipient_name: data.recipient_name,
    //   recipient_email: data.recipient_email,
    // });
    addGiftCard.mutate(data);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
              <GiftCardCard
                giftCard={giftCard}
                handlePrintGiftCard={handlePrintGiftCard}
              />
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
            <GiftCardForm
              formId="createGiftCardForm"
              onSubmit={handleCreateGiftCard}
            />
            {/* <TextField
              label="Montant initial"
              type="number"
              value={createForm.initial_value}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  initial_value: e.target.value,
                }))
              }
              required
            />
            <TextField
              label="Date d'expiration"
              type="date"
              value={createForm.expires_at}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  expires_at: e.target.value,
                }))
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
            /> */}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={() => setIsCreateDialogOpen(false)}
            startIcon={<Cancel />}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            type="submit"
            form="createGiftCardForm"
            startIcon={<Save />}
            loading={addGiftCard.isPending}
          >
            Créer
          </Button>
        </DialogActions>
      </Dialog>
      {giftCardPrintNode}
    </Container>
  );
};

export default GiftCard;
