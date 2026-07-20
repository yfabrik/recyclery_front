import {
  Add,
  CardGiftcard,
  CheckCircle,
  Delete,
  Edit,
  Schedule,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import type { DonationDataInput } from "@recyclerie/api/schemas/donations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getDonationStatusColor,
  getDonationStatusLabel,
} from "../../constants/donationStatuses";
import { useQueryErrorToast } from "../../hooks/useQueryErrorToast";
import type { DonModel } from "../../interfaces/Models";
import {
  createDonation,
  deleteDonation,
  getDonations,
  getDonationsStats,
  updateDonation
} from "../../services/api/donations";
import { formatCurrency } from "../../services/cartService";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../utils/apiToastMessage";
import { DonForm, type DonFormValues, type Schema } from "../forms/DonForm";
import { Loading } from "../Loading";
import { StatCard } from "../StatCard";

function donationToFormValues(donation: DonModel): Partial<DonFormValues> {
  return {
    donor_name: donation.donor_name ?? "",
    donor_email: donation.donor_email ?? "",
    donor_phone: donation.donor_phone ?? "",
    item_description: donation.item_description ?? "",
    estimated_value: donation.estimated_value ?? 0,
    weight: donation.weight ?? 0,
    status: donation.status,
  };
}

export const DonationsTab = () => {

  const [donationDialog, setDonationDialog] = useState(false);
  const [editingDonationId, setEditingDonationId] = useState<DonModel["id"] | null>(null);
  const [formDefaults, setFormDefaults] = useState<Partial<DonFormValues> | null>(null);

  const queryClient = useQueryClient()

  const donations = useQuery({
    queryKey: ["dons"],
    queryFn: () => getDonations().then(response => response.data.data)
  })
  useQueryErrorToast(donations.error, "Erreur lors du chargement des dons");

  const donationStats = useQuery({
    queryKey: ["donStats"],
    queryFn: () => getDonationsStats().then(response => response.data.data)
  })

  const createDonationPayloadFromForm = (data: Schema): DonationDataInput => ({...data});
  const addDon = useMutation({
    mutationFn: (data: Schema) => createDonation(createDonationPayloadFromForm(data)),
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Don enregistré avec succès"))
      saved()

    }
  })

  const editDon = useMutation({
    mutationFn: ({ id, data }: { id: DonModel["id"], data: Schema }) => updateDonation(id, createDonationPayloadFromForm(data)),
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Don mis à jour avec succès"))
      saved()
    }

  })
  const deleteDon = useMutation({
    mutationFn: (id: DonModel["id"]) => deleteDonation(id),
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Don supprimé avec succès"))
      queryClient.invalidateQueries({ queryKey: ["donStats"] })
      queryClient.invalidateQueries({ queryKey: ["dons"] })
    }
  })

  const saved = () => {
    queryClient.invalidateQueries({ queryKey: ["donStats"] })
    queryClient.invalidateQueries({ queryKey: ["dons"] })
    handleCloseDonationDialog();
  }

  const handleOpenDonationDialog = (donation: DonModel | null = null) => {
    setEditingDonationId(donation?.id ?? null);
    setFormDefaults(donation ? donationToFormValues(donation) : null);
    setDonationDialog(true);
  };

  const handleCloseDonationDialog = () => {
    setDonationDialog(false);
    setEditingDonationId(null);
    setFormDefaults(null);
  };

  const handleSaveDonation = async (data: Schema) => {
    
    if (editingDonationId) {
      editDon.mutate({ id: editingDonationId, data });
    } else {
      addDon.mutate(data);
    }
  };

  const handleDeleteDonation = (donation: DonModel) => {
    if (confirm("Voulez-vous vraiment supprimer ce don ?")) {
      deleteDon.mutate(donation.id)
    }
  }

  return (
    <Box>
      {/* Statistiques des dons */}
      {donationStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Dons"
                value={Number(donationStats.data?.total_donations ?? 0)}
              icon={<CardGiftcard />}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="En Attente"
                value={Number(donationStats.data?.pending_donations ?? 0)}
              icon={<Schedule />}
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Acceptés"
                value={Number(donationStats.data?.accepted_donations ?? 0)}
              icon={<CheckCircle />}
              color="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Valeur Estimée"
                value={formatCurrency(Number(donationStats.data?.total_estimated_value ?? 0))}
              icon={<TrendingUp />}
              color="info"
            />
          </Grid>
        </Grid>
      )}

      {/* Bouton d'ajout */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDonationDialog()}
        >
          Nouveau Don
        </Button>
      </Box>

      {/* Liste des dons */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Bénéficiaire</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Valeur Estimée</TableCell>
              <TableCell>Poids</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Donné par</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Loading isLoading={donations.isLoading} tableCols={8}>
              {donations.data?.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    {donation.createdAt
                      ? new Date(donation.createdAt).toLocaleDateString("fr-FR")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {donation.donor_name}
                      </Typography>
                      {(donation.donor_phone || donation.donor_email) && (
                        <Typography variant="caption" color="text.secondary">
                          {[donation.donor_phone, donation.donor_email]
                            .filter(Boolean)
                            .join(" · ")}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {donation.item_description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(donation.estimated_value ?? 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {donation.weight || 0} kg
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getDonationStatusLabel(donation.status)}
                      color={getDonationStatusColor(donation.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{donation.User?.username || "-"}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDonationDialog(donation)}
                      title="Modifier"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDonationDialog(donation)}
                      title="Voir les détails"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDonation(donation)}
                      title="Supprimer"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </Loading>
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog pour créer/modifier un don */}
      <Dialog
        open={donationDialog}
        onClose={handleCloseDonationDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDonationId ? "Modifier le Don" : "Nouveau Don"}
        </DialogTitle>
        <DialogContent>
          <DonForm
            formId="donForm"
            onSubmit={handleSaveDonation}
            defaultValues={formDefaults ?? undefined}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDonationDialog}>Annuler</Button>
          <Button type="submit" form="donForm" variant="contained">
            {editingDonationId ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
