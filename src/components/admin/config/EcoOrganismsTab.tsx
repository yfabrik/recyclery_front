import {
  Add,
  Block,
  CheckCircle,
  Compost,
  Delete,
  Edit,
  Email,
  Nature,
  Phone,
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
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from "@mui/material";

import type { EcoOrganismDataInput } from "@recyclerie/api/schemas/ecoOrganism";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { useQueryErrorToast } from "../../../hooks/useQueryErrorToast";
import type { EcoOrgModel } from "../../../interfaces/Models";
import {
  createEcoOrganism,
  deleteEcoOrganism,
  fetchEcoOrganismsStats,
  getEcoOrganisms,
  updateEcoOrganism
} from "../../../services/api/ecoOrganism";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import { EcoOrganismForm, type EcoOrganismFormValues, type Schema } from "../../forms/EcoOrganismForm";
import { Loading } from "../../Loading";
import { StatCard } from "../../StatCard";

function ecoOrganismToFormValues(org: EcoOrgModel): Partial<EcoOrganismFormValues> {
  const raw = org as EcoOrgModel & {
    incategories?: Array<{ id: number }>;
    sellcategories?: Array<{ id: number }>;
    inCategories?: Array<{ id: number }>;
    sellCategories?: Array<{ id: number }>;
  };
  const inCats = raw.inCategories ?? raw.incategories ?? [];
  const sellCats = raw.sellCategories ?? raw.sellcategories ?? [];
  return {
    name: org.name,
    description: org.description ?? "",
    contact_email: org.contact_email ?? "",
    contact_phone: org.contact_phone ?? "",
    address: org.address ?? "",
    website: org.website ?? "",
    is_active: org.is_active,
    inCategories: inCats.map((cat) => (typeof cat === "number" ? cat : cat.id)),
    sellCategories: sellCats.map((cat) => (typeof cat === "number" ? cat : cat.id)),
  };
}

export const EcoOrganismsTab = () => {
  const [ecoOrganismDialog, setEcoOrganismDialog] = useState(false);
  const [editingEcoOrganismId, setEditingEcoOrganismId] = useState<EcoOrgModel["id"] | null>(null);
  const [formDefaults, setFormDefaults] = useState<Partial<EcoOrganismFormValues> | null>(
    null,
  );

  const queryClient = useQueryClient()
  const ecoOrganisms = useQuery({
    queryKey: ["ecoOrganism", { include: ["incategories", "sellcategories"] }],
    queryFn: () => getEcoOrganisms({ include: ["incategories", "sellcategories"] }).then(response => response.data.data)
  })
  useQueryErrorToast(
    ecoOrganisms.error,
    "Erreur lors du chargement des éco-organismes",
  );

  const ecoOrganismStats = useQuery({
    queryKey: ["ecoStats"],
    queryFn: () => fetchEcoOrganismsStats().then(response => response.data.data)
  })
  useQueryErrorToast(
    ecoOrganismStats.error,
    "Erreur lors du chargement des statistiques",
  );

  const ecoOrganismPayloadFromForm = (data: Schema): EcoOrganismDataInput => ({...data});
  const editEcoOrganism = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Schema }) => updateEcoOrganism(id, ecoOrganismPayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Éco-organisme mis à jour avec succès"));
      handleCloseEcoOrganismDialog();
      queryClient.invalidateQueries({ queryKey: ["ecoOrganism"] })
      queryClient.invalidateQueries({ queryKey: ["ecoStats"] })

    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde"))
  })
  const addEcoOrganism = useMutation({
    mutationFn: (data: Schema) => createEcoOrganism(ecoOrganismPayloadFromForm(data)),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Éco-organisme créé avec succès"));
      handleCloseEcoOrganismDialog();
      queryClient.invalidateQueries({ queryKey: ["ecoOrganism"] })
      queryClient.invalidateQueries({ queryKey: ["ecoStats"] })

    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde"))
  })
  const removeEcoOrganism = useMutation({
    mutationFn: (id: number) => deleteEcoOrganism(id),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Éco-organisme supprimé avec succès"));
      queryClient.invalidateQueries({ queryKey: ["ecoOrganism"] })
      queryClient.invalidateQueries({ queryKey: ["ecoStats"] })

    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression"))
  })

  // const fetchEcoOrganisms = async () => {
  //   try {
  //     const response = await getEcoOrganisms();
  //     setEcoOrganisms(response.data.eco_organisms || []);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des éco-organismes:", error);
  //     toast.error("Erreur lors du chargement des éco-organismes");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const fetchEcoOrganismStats = async () => {
  //   try {
  //     const response = await fetchEcoOrganismsStats();
  //     setEcoOrganismStats(response.data.stats);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des statistiques:", error);
  //   }
  // };

  const handleOpenEcoOrganismDialog = (
    ecoOrganism: EcoOrgModel | null = null
  ) => {
    setEditingEcoOrganismId(ecoOrganism?.id ?? null);
    setFormDefaults(ecoOrganism ? ecoOrganismToFormValues(ecoOrganism) : null);
    setEcoOrganismDialog(true);
  };

  const handleCloseEcoOrganismDialog = () => {
    setEcoOrganismDialog(false);
    setEditingEcoOrganismId(null);
    setFormDefaults(null);
  };

  const handleSaveEcoOrganism = async (data: Schema) => {
    if (editingEcoOrganismId) {
      editEcoOrganism.mutate({ id: editingEcoOrganismId, data })
    } else {
      addEcoOrganism.mutate(data)
    }
  };

  const handleDeleteEcoOrganism = async (id: number) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir supprimer cet éco-organisme ?")
    ) {
      return;
    }
    removeEcoOrganism.mutate(id)
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold"><Compost /> Gestion des Éco-organismes</Typography>
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
              value={Number(ecoOrganismStats.data?.total_eco_organisms ?? 0)}
              icon={<Nature />}
              color="primary"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title=" Actifs"
              value={Number(ecoOrganismStats.data?.active_eco_organisms ?? 0)}
              icon={<CheckCircle />}
              color="success"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <StatCard
              title="Inactifs"
              value={Number(ecoOrganismStats.data?.inactive_eco_organisms ?? 0)}
              icon={<Block />}
              color="error"
            />
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
            <Loading isLoading={ecoOrganisms.isLoading} tableCols={6}
            >

              {ecoOrganisms.data?.map((org) => (
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
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Email sx={{ fontSize: 16 }} />
                          {org.contact_email}
                        </Typography>
                      )}
                      {org.contact_phone && (
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Phone sx={{ fontSize: 16 }} />
                          {org.contact_phone}
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
            </Loading>

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
          {editingEcoOrganismId
            ? "Modifier l'Éco-organisme"
            : "Nouvel Éco-organisme"}
        </DialogTitle>
        <DialogContent>
          <EcoOrganismForm
            formId="ecoOrgForm"
            onSubmit={handleSaveEcoOrganism}
            defaultValues={formDefaults ?? undefined}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEcoOrganismDialog}>Annuler</Button>
          <Button form="ecoOrgForm" variant="contained" type="submit" loading={addEcoOrganism.isPending || editEcoOrganism.isPending}>
            {editingEcoOrganismId ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
