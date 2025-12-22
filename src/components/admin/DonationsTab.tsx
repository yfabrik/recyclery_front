import {
  Add,
  CardGiftcard,
  CheckCircle,
  Edit,
  Schedule,
  TrendingUp,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface donor {
  id?: number;
  donor_name: string;
  donor_contact: string;
  item_description: string;
  estimated_value: string;
  status: string;
  created_at?:Date
  received_by_name?:string
}

export const DonationsTab = () => {
  const [donations, setDonations] = useState<donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationDialog, setDonationDialog] = useState(false);
  const [editingDonation, setEditingDonation] = useState<donor | null>(null);
  const [donationForm, setDonationForm] = useState<donor>({
    donor_name: "",
    donor_contact: "",
    item_description: "",
    estimated_value: "",
    status: "pending",
  });
  const [donationStats, setDonationStats] = useState(null);

  useEffect(() => {
    fetchDonations();
    fetchDonationStats();
  }, []);

  const fetchDonations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/donations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonations(response.data.donations || []);
    } catch (error) {
      console.error("Erreur lors du chargement des dons:", error);
      toast.error("Erreur lors du chargement des dons");
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/donations/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDonationStats(response.data.stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleOpenDonationDialog = (donation: donor | null = null) => {
    if (donation) {
      setEditingDonation(donation);
      setDonationForm({
        donor_name: donation.donor_name || "",
        donor_contact: donation.donor_contact || "",
        item_description: donation.item_description || "",
        estimated_value: donation.estimated_value?.toString() || "",
        status: donation.status || "pending",
      });
    } else {
      setEditingDonation(null);
      setDonationForm({
        donor_name: "",
        donor_contact: "",
        item_description: "",
        estimated_value: "",
        status: "pending",
      });
    }
    setDonationDialog(true);
  };

  const handleCloseDonationDialog = () => {
    setDonationDialog(false);
    setEditingDonation(null);
  };

  const handleSaveDonation = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = editingDonation
        ? `/api/donations/${editingDonation.id}`
        : "/api/donations";

      const method = editingDonation ? "put" : "post";

      console.log("Données envoyées:", donationForm);

      await axios[method](url, donationForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(
        editingDonation
          ? "Don mis à jour avec succès"
          : "Don enregistré avec succès"
      );

      handleCloseDonationDialog();
      fetchDonations();
      fetchDonationStats();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const getStatusColor = (status) => {
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

  const getStatusLabel = (status) => {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Statistiques des dons */}
      {donationStats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Dons
                    </Typography>
                    <Typography variant="h4">
                      {donationStats.total_donations || 0}
                    </Typography>
                  </Box>
                  <CardGiftcard color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      En Attente
                    </Typography>
                    <Typography variant="h4">
                      {donationStats.pending_donations || 0}
                    </Typography>
                  </Box>
                  <Schedule color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Acceptés
                    </Typography>
                    <Typography variant="h4">
                      {donationStats.accepted_donations || 0}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Valeur Estimée
                    </Typography>
                    <Typography variant="h4">
                      {formatCurrency(donationStats.total_estimated_value)}
                    </Typography>
                  </Box>
                  <TrendingUp color="info" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
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
              <TableCell>Statut</TableCell>
              <TableCell>Donné par</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>
                  {new Date(donation.created_at).toLocaleDateString("fr-FR")}
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
                  <Chip
                    label={getStatusLabel(donation.status)}
                    color={getStatusColor(donation.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{donation.received_by_name || "-"}</TableCell>
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
                </TableCell>
              </TableRow>
            ))}
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nom du Bénéficiaire"
                value={donationForm.donor_name}
                onChange={(e) =>
                  setDonationForm((prev) => ({
                    ...prev,
                    donor_name: e.target.value,
                  }))
                }
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Contact (email/téléphone)"
                value={donationForm.donor_contact}
                onChange={(e) =>
                  setDonationForm((prev) => ({
                    ...prev,
                    donor_contact: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description du Don"
                value={donationForm.item_description}
                onChange={(e) =>
                  setDonationForm((prev) => ({
                    ...prev,
                    item_description: e.target.value,
                  }))
                }
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Valeur Estimée (€)"
                type="number"
                value={donationForm.estimated_value}
                onChange={(e) =>
                  setDonationForm((prev) => ({
                    ...prev,
                    estimated_value: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={donationForm.status}
                  onChange={(e) =>
                    setDonationForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  label="Statut"
                >
                  <MenuItem value="pending">En Attente</MenuItem>
                  <MenuItem value="accepted">Accepté</MenuItem>
                  <MenuItem value="rejected">Refusé</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDonationDialog}>Annuler</Button>
          <Button onClick={handleSaveDonation} variant="contained">
            {editingDonation ? "Mettre à jour" : "Enregistrer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
