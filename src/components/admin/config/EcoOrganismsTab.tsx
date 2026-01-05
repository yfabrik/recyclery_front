import {
  Add,
  Block,
  CheckCircle,
  Delete,
  Edit,
  Nature,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  createEcoOrganism,
  deleteEcoOrganism,
  fetchEcoOrganismsStats,
  getEcoOrganisms,
  updateEcoOrganism,
} from "../../../services/api/ecoOrganism";
import { StatCard } from "../../StatCard";
import type { EcoOrgModel } from "../../../interfaces/Models";
import { EcoOrganismForm } from "../../forms/EcoOrganismForm";

export const EcoOrganismsTab = () => {
  const [ecoOrganisms, setEcoOrganisms] = useState<EcoOrgModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [ecoOrganismDialog, setEcoOrganismDialog] = useState(false);
  const [editingEcoOrganism, setEditingEcoOrganism] =
    useState<EcoOrgModel | null>(null);
  // const [ecoOrganismForm, setEcoOrganismForm] = useState<EcoOrgModel>({
  //   name: "",
  //   description: "",
  //   contact_email: "",
  //   contact_phone: "",
  //   address: "",
  //   website: "",
  //   is_active: true,
  // });
  const [ecoOrganismStats, setEcoOrganismStats] = useState(null);

  useEffect(() => {
    fetchEcoOrganisms();
    fetchEcoOrganismStats();
  }, []);

  const fetchEcoOrganisms = async () => {
    try {
      const response = await getEcoOrganisms();
      setEcoOrganisms(response.data.eco_organisms || []);
    } catch (error) {
      console.error("Erreur lors du chargement des éco-organismes:", error);
      toast.error("Erreur lors du chargement des éco-organismes");
    } finally {
      setLoading(false);
    }
  };

  const fetchEcoOrganismStats = async () => {
    try {
      const response = await fetchEcoOrganismsStats();
      setEcoOrganismStats(response.data.stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleOpenEcoOrganismDialog = (
    ecoOrganism: EcoOrgModel | null = null
  ) => {
      setEditingEcoOrganism(ecoOrganism);

    // if (ecoOrganism) {
    //   setEditingEcoOrganism(ecoOrganism);
    //   setEcoOrganismForm({
    //     name: ecoOrganism.name,
    //     description: ecoOrganism.description || "",
    //     contact_email: ecoOrganism.contact_email || "",
    //     contact_phone: ecoOrganism.contact_phone || "",
    //     address: ecoOrganism.address || "",
    //     website: ecoOrganism.website || "",
    //     is_active: ecoOrganism.is_active,
    //   });
    // } else {
    //   setEditingEcoOrganism(null);
    //   setEcoOrganismForm({
    //     name: "",
    //     description: "",
    //     contact_email: "",
    //     contact_phone: "",
    //     address: "",
    //     website: "",
    //     is_active: true,
    //   });
    // }
    setEcoOrganismDialog(true);
  };

  const handleCloseEcoOrganismDialog = () => {
    setEcoOrganismDialog(false);
    setEditingEcoOrganism(null);
  };

  const handleSaveEcoOrganism = async (data) => {
    try {
      const response = editingEcoOrganism?.id
        ? await updateEcoOrganism(editingEcoOrganism.id, data)
        : await createEcoOrganism(data);

      toast.success(
        editingEcoOrganism
          ? "Éco-organisme mis à jour avec succès"
          : "Éco-organisme créé avec succès"
      );

      handleCloseEcoOrganismDialog();
      fetchEcoOrganisms();
      fetchEcoOrganismStats();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDeleteEcoOrganism = async (id) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cet éco-organisme ?")
    ) {
      return;
    }

    try {
      await deleteEcoOrganism(id);
      toast.success("Éco-organisme supprimé avec succès");
      fetchEcoOrganisms();
      fetchEcoOrganismStats();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">🌱 Gestion des Éco-organismes</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenEcoOrganismDialog()}
        >
          Nouvel Éco-organisme
        </Button>
      </Box>

      {/* Statistiques */}
      {ecoOrganismStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title=" Total Éco-organismes"
              value={ecoOrganismStats.total_eco_organisms}
            >
              <Nature color="primary" sx={{ fontSize: 40 }} />
            </StatCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title=" Actifs"
              value={ecoOrganismStats.active_eco_organisms}
            >
              <CheckCircle color="success" sx={{ fontSize: 40 }} />
            </StatCard>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Inactifs"
              value={ecoOrganismStats.inactive_eco_organisms}
            >
              <Block color="error" sx={{ fontSize: 40 }} />
            </StatCard>
          </Grid>
        </Grid>
      )}

      {/* Table des éco-organismes */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Site Web</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ecoOrganisms.map((org) => (
              <TableRow key={org.id}>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {org.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {org.description || "Aucune description"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    {org.contact_email && (
                      <Typography variant="body2">
                        📧 {org.contact_email}
                      </Typography>
                    )}
                    {org.contact_phone && (
                      <Typography variant="body2">
                        📞 {org.contact_phone}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {org.website && (
                    <Button
                      size="small"
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visiter
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={org.is_active ? "Actif" : "Inactif"}
                    color={org.is_active ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEcoOrganismDialog(org)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteEcoOrganism(org.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue de création/modification */}
      <Dialog
        open={ecoOrganismDialog}
        onClose={handleCloseEcoOrganismDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingEcoOrganism
            ? "Modifier l'Éco-organisme"
            : "Nouvel Éco-organisme"}
        </DialogTitle>
        <DialogContent>
          <EcoOrganismForm
            formId="ecoOrgForm"
            onSubmit={handleSaveEcoOrganism}
            defaultValues={editingEcoOrganism}
          />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEcoOrganismDialog}>Annuler</Button>
          <Button form="ecoOrgForm" variant="contained" type="submit">
            {editingEcoOrganism ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
