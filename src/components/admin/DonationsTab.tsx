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
  CircularProgress,
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
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import type { DonModel } from "../../interfaces/Models";
import {
  createDonation,
  deleteDonation,
  getDonations,
  getDonationsStats,
  updateDonation,
} from "../../services/api/donations";
import { DonForm, type Schema } from "../forms/DonForm";
import { StatCard } from "../StatCard";
import { Loading } from "../Loading";

export const DonationsTab = () => {

  const [donationDialog, setDonationDialog] = useState(false);
  const [editingDonation, setEditingDonation] = useState<DonModel | null>(null);

  const queryClient = useQueryClient()

  const donations = useQuery({
    queryKey: ["dons"],
    queryFn: () => getDonations().then(response => response.data.donations)
  })
  if (donations.isError) toast.error("Erreur lors du chargement des dons");

  const donationStats = useQuery({
    queryKey: ["donStats"],
    queryFn: () => getDonationsStats().then(response => response.data.stats)
  })


  const addDon = useMutation({
    mutationFn: (data: Schema) => createDonation(data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      toast.success("Don enregistré avec succès")
      saved()

    }
  })

  const editDon = useMutation({
    mutationFn: (data: { id: number, data: Schema }) => updateDonation(data.id, data.data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      toast.success("Don mis à jour avec succès")
      saved()
    }

  })
  const deleteDon = useMutation({
    mutationFn: (id: number) => deleteDonation(id),
    onError: () => toast.error("Erreur lors de la suppression"),
    onSuccess: () => {
      toast.success("Don supprimé avec succès")
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
    setEditingDonation(donation);
    setDonationDialog(true);
  };

  const handleCloseDonationDialog = () => {
    setDonationDialog(false);
    setEditingDonation(null);
  };

  const handleSaveDonation = async (data: Schema) => {
    if (editingDonation?.id) {
      editDon.mutate({ id: editingDonation.id, data })
    } else {
      addDon.mutate(data)
    }
  };

  const handleDeleteDonation = (donation: DonModel) => {
    if (confirm("Voulez-vous vraiment supprimer ce don ?")) {
      deleteDon.mutate(donation.id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Accepté";
      case "rejected":
        return "Refusé";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);
  };



  return (
    <Box>
      {/* Statistiques des dons */}
      {donationStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Total Dons" value={donationStats.data?.total_donations || 0}>
              <CardGiftcard color="primary" sx={{ fontSize: 40 }} />
            </StatCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="En Attente"
              value={donationStats.data?.pending_donations || 0}
            >
              <Schedule color="warning" sx={{ fontSize: 40 }} />
            </StatCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard title="Acceptés" value={donationStats.data?.accepted_donations || 0}>
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
            </StatCard>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Valeur Estimée"
              value={formatCurrency(donationStats.data?.total_estimated_value || 0)}
            >
              <TrendingUp color="info" sx={{ fontSize: 40 }} />
            </StatCard>
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
                    {new Date(donation.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">
                        {donation.donor_name}
                      </Typography>
                      {donation.donor_contact && (
                        <Typography variant="caption" color="text.secondary">
                          {donation.donor_contact}
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
                      {formatCurrency(donation.estimated_value)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {donation.weight || 0} kg
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(donation.status)}
                      color={getStatusColor(donation.status)}
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
          {editingDonation ? "Modifier le Don" : "Nouveau Don"}
        </DialogTitle>
        <DialogContent>
          <DonForm
            formId="donForm"
            onSubmit={handleSaveDonation}
            defaultValues={editingDonation}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDonationDialog}>Annuler</Button>
          <Button type="submit" form="donForm" variant="contained">
            {editingDonation ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
