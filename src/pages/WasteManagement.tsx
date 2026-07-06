import {
  Add,
  Assessment,
  Delete,
  DeleteSweep,
  Edit,
  Nature,
  TrendingUp
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
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
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateWasteResponse, UpdateWasteResponse } from "@recyclerie/api/responses/waste";
import type { AxiosResponse } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { Loading } from "../components/Loading";
import { WasteFilterForm, type Filters } from "../components/forms/WasteFilterForm";
import { WasteForm, type Schema } from "../components/forms/WasteForm";
import type { WasteModel } from "../interfaces/Models";
import {
  getDisposalTypeColor,
  getDisposalTypeLabel,
} from "../constants/disposalTypes";
import { fetchCategories as fcat } from "../services/api/categories";
import { getEcoOrganisms } from "../services/api/ecoOrganism";
import {
  createWaste,
  deleteWaste,
  getWastes,
  getWasteStats,
  updateWaste,
  type WasteFilter,
  type WastePayload,
} from "../services/api/wasteDisposal";
import { StatCard } from "../components/StatCard";

function wasteToFormValues(disposal: WasteModel): Partial<Schema> {
  return {
    disposal_date: new Date(disposal.disposal_date),
    disposal_type:
      disposal.disposal_type === "recycling"
        ? "other"
        : disposal.disposal_type,
    category_id: disposal.category_id,
    subcategory_id: disposal.subcategory_id ?? "",
    eco_organism_id: disposal.eco_organism_id ?? "",
    weight_kg: Number(disposal.weight_kg),
    volume_m3: Number(disposal.volume_m3 ?? 0),
    transport_method: disposal.transport_method ?? "",
    transport_company: disposal.transport_company ?? "",
    transport_cost: Number(disposal.transport_cost ?? 0),
    notes: disposal.notes ?? "",
  };
}

const WasteManagement = () => {

  // États pour les dialogues
  const [disposalDialog, setDisposalDialog] = useState(false);
  const [editingDisposalId, setEditingDisposalId] = useState<number | null>(null);
  const [formDefaults, setFormDefaults] = useState<Partial<Schema> | null>(null);


  // // États pour la pagination
  // const [pagination, setPagination] = useState({
  //   page: 1,
  //   limit: 20,
  //   total: 0,
  //   totalPages: 0,
  // });

  const [filters, setFilters] = useState<Filters>({
    category_id: "",
    disposal_type: "",
    date_from: new Date(new Date().setDate(new Date().getDate() - 7)),
    date_to: new Date()
  })


  const queryClient = useQueryClient()
  const categories = useQuery({
    queryKey: ["categories", {
      only_category: true,
      include: ["category"],
      out: true,
    }],
    queryFn: () => fcat({
      only_category: true,
      include: ["category"],
      out: true,
    }).then(response => response.data.data)
  })

  const ecoOrganisms = useQuery({
    queryKey: ["ecoOrganisms", { active: true }],
    queryFn: () => getEcoOrganisms({ active: true }).then(response => response.data.data)
  })

  const disposals = useQuery({
    queryKey: ["disposals", { filters }],
    queryFn: () => {
      const o: WasteFilter = Object.fromEntries(Object.entries(filters).filter(([, v]) => !!v));
      return getWastes(o).then(response => response.data.data)
    },
    placeholderData: keepPreviousData
  })

  const stats = useQuery({
    queryKey: ["wasteStats"],
    queryFn: () => getWasteStats().then(response => response.data.data)
  })


  const addWaste = useMutation({
    mutationFn: (data: WastePayload) => createWaste(data),
    onSuccess: (data) => {
      save(data)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  })
  const editWaste = useMutation({
    mutationFn: (data: { id: number, data: WastePayload }) => updateWaste(data.id, data.data),
    onSuccess: (data) => {
      save(data)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  })
  const save = (data: AxiosResponse<UpdateWasteResponse | CreateWasteResponse>) => {
    toast.success(
      getApiSuccessMessage(
        data,
        editingDisposalId
          ? "Sortie de déchets mise à jour avec succès"
          : "Sortie de déchets créée avec succès",
      ),
    );
    handleCloseDisposalDialog();
    queryClient.invalidateQueries({ queryKey: ["wasteStats"] })
    queryClient.invalidateQueries({ queryKey: ["disposals"] })

  }
  const removeWaste = useMutation({
    mutationFn: (id: number) => deleteWaste(id),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Sortie de déchets supprimée avec succès"));
      queryClient.invalidateQueries({ queryKey: ["wasteStats"] })
      queryClient.invalidateQueries({ queryKey: ["disposals"] })
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
  })

  const handleOpenDisposalDialog = (disposal: WasteModel | null = null) => {
    setEditingDisposalId(disposal?.id ?? null);
    setFormDefaults(disposal ? wasteToFormValues(disposal) : null);
    setDisposalDialog(true);
  };

  const handleCloseDisposalDialog = () => {
    setDisposalDialog(false);
    setEditingDisposalId(null);
    setFormDefaults(null);
  };

  const handleSaveDisposal = async (data: Schema) => {
    const payload: WastePayload = {
      ...data,
      subcategory_id: data.subcategory_id === "" ? null : data.subcategory_id,
      eco_organism_id: data.eco_organism_id === "" ? null : data.eco_organism_id,
      transport_method: data.transport_method === "" ? null : data.transport_method,
      transport_company: data.transport_company === "" ? null : data.transport_company,
      notes: data.notes === "" ? null : data.notes,
    };
    if (editingDisposalId) {
      editWaste.mutate({ id: editingDisposalId, data: payload });
    } else {
      addWaste.mutate(payload);
    }
  };

  const handleDeleteDisposal = async (id: number) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette sortie de déchets ?",
      )
    ) {
      return;
    }
    removeWaste.mutate(id)
  };


  const formatWeight = (weight: number | string) => {
    const kg = Number(weight);
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} t`;
    }
    return `${kg} kg`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            <DeleteSweep /> Gestion des Déchets
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Suivez et gérez les sorties de déchets vers les éco-organismes et
            déchetteries
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDisposalDialog()}
        >
          Nouvelle Sortie
        </Button>
      </Box>
      {/* Statistiques */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Loading isLoading={stats.isLoading}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Sorties"
                value={Number(stats.data?.total_disposals ?? 0)}
                icon={<Assessment />}
                color="primary"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Poids Total"
                value={formatWeight(stats.data?.total_weight_kg || 0)}
                icon={<TrendingUp />}
                color="success"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Éco-organismes"
                value={Number(stats.data?.eco_organism_disposals ?? 0)}
                icon={<Nature />}
                color="success"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Déchetterie"
                value={Number(stats.data?.landfill_disposals ?? 0)}
                icon={<DeleteSweep />}
                color="warning"
              />
            </Grid>
          </Loading>
        </Grid>
      )}
      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <WasteFilterForm
          categories={categories.data || []}
          defaultValues={filters}
          onChange={(values) => setFilters((prev) => ({
            ...prev,
            ...values,
          }))}
        />
      </Paper>
      {/* Table des sorties de déchets */}
      <Paper>
        <Loading isLoading={disposals.isLoading}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Numéro</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Poids</TableCell>
                  <TableCell>Transport</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {disposals.data?.map((disposal) => (
                  <TableRow key={disposal.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {disposal.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(disposal.disposal_date).toLocaleDateString(
                        "fr-FR",
                      )}
                    </TableCell>
                    <TableCell>
                      {disposal.category?.name || "Non spécifié"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getDisposalTypeLabel(disposal.disposal_type)}
                        color={getDisposalTypeColor(disposal.disposal_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {disposal.eco_organism?.name || "Non spécifié"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatWeight(disposal.weight_kg || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {disposal.transport_company && (
                        <Typography variant="body2">
                          {disposal.transport_company}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDisposalDialog(disposal)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteDisposal(disposal.id)}
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
        </Loading>
      </Paper>
      {/* Dialogue de création/modification */}
      <Dialog
        open={disposalDialog}
        onClose={handleCloseDisposalDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDisposalId
            ? "Modifier la Sortie de Déchets"
            : "Nouvelle Sortie de Déchets"}
        </DialogTitle>
        <DialogContent>
          <WasteForm
            formId="wasteForm"
            defaultValues={formDefaults}
            onSubmit={handleSaveDisposal}
            categories={categories.data || []}
            ecoOrganisms={ecoOrganisms.data || []}
            onWeightFieldClick={() => { }}
          />

        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisposalDialog}>Annuler</Button>
          <Button type="submit" form="wasteForm" variant="contained">
            {editingDisposalId ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WasteManagement;
