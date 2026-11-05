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
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { Loading } from "../components/Loading";
import { WasteFilterForm } from "../components/forms/filters/WasteFilterForm";
import { WasteForm } from "../components/forms/WasteForm";
import type { WasteModel } from "../interfaces/Models";
import {
  getDisposalTypeColor,
  getDisposalTypeLabel,
} from "../constants/disposalTypes";
import { fetchCategories as fcat } from "../services/api/categories";
import { getEcoOrganisms } from "../services/api/ecoOrganism";
import { useUrlFilters } from "../hooks/useUrlFilters";
import {
  createWaste,
  deleteWaste,
  getWastes,
  getWasteStats,
  updateWaste,
} from "../services/api/wasteDisposal";
import {
  toWasteQuery,
  wastePayloadFromForm,
  wasteToFormValues,
} from "../services/mapper/waste";
import {
  getWasteFilterFormDefaults,
  wasteFilterFormSchema,
  type WasteFormOutput,
  type WasteFormValues,
} from "../services/schema/waste";
import { StatCard } from "../components/StatCard";

const WasteManagement = () => {

  // États pour les dialogues
  const [disposalDialog, setDisposalDialog] = useState(false);
  const [editingDisposalId, setEditingDisposalId] = useState<WasteModel["id"] | null>(null);
  const [formDefaults, setFormDefaults] = useState<Partial<WasteFormValues> | null>(null);


  // // États pour la pagination
  // const [pagination, setPagination] = useState({
  //   page: 1,
  //   limit: 20,
  //   total: 0,
  //   totalPages: 0,
  // });

  const defaults = useMemo(() => getWasteFilterFormDefaults(), []);
  const { filters, setFilters } = useUrlFilters({
    schema: wasteFilterFormSchema,
    defaults,
  });
  const query = useMemo(() => toWasteQuery(filters), [filters]);

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
    queryKey: ["disposals", query],
    queryFn: () => getWastes(query).then(response => response.data.data),
    placeholderData: keepPreviousData
  })

  const totalStats = useQuery({
    queryKey: ["wasteStats", "total"],
    queryFn: () => getWasteStats().then(response => response.data.data)
  })

  const filteredStats = useQuery({
    queryKey: ["wasteStats", "filtered", query],
    queryFn: () => getWasteStats(query).then(response => response.data.data),
    placeholderData: keepPreviousData
  })


  const addWaste = useMutation({
    mutationFn: (data: WasteFormOutput) =>
      createWaste(wastePayloadFromForm(data)),
    onSuccess: (data) => {
      save(data)
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  })
  const editWaste = useMutation({
    mutationFn: (data: { id: WasteModel["id"]; data: WasteFormOutput }) =>
      updateWaste(data.id, wastePayloadFromForm(data.data)),
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
    mutationFn: (id: WasteModel["id"]) => deleteWaste(id),
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

  const handleSaveDisposal = async (data: WasteFormOutput) => {

    if (editingDisposalId) {
      editWaste.mutate({ id: editingDisposalId, data });
    } else {
      addWaste.mutate(data);
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

  const formatCount = (value?: number | null) => String(Number(value ?? 0));
  const formatStatWeight = (value?: number | null) => formatWeight(value || 0);

  const statCards = [
    { key: "total_disposals", title: "Total Sorties", icon: <Assessment />, color: "primary", format: formatCount },
    { key: "total_weight_kg", title: "Poids Total", icon: <TrendingUp />, color: "success", format: formatStatWeight },
    { key: "eco_organism_disposals", title: "Éco-organismes", icon: <Nature />, color: "success", format: formatCount },
    { key: "landfill_disposals", title: "Déchetterie", icon: <DeleteSweep />, color: "warning", format: formatCount },
  ] as const;

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
      <Loading isLoading={totalStats.isLoading || filteredStats.isLoading}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map(({ key, title, icon, color, format }) => (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title={title}
                value={format(filteredStats.data?.[key])}
                subtitle={`Total : ${format(totalStats.data?.[key])}`}
                icon={icon}
                color={color}
              />
            </Grid>
          ))}
        </Grid>
      </Loading>
      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <WasteFilterForm
          categories={categories.data || []}
          defaultValues={filters}
          onChange={setFilters}
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
