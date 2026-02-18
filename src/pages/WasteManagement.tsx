import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add,
  Assessment,
  Delete,
  DeleteSweep,
  Edit,
  FilterList,
  Nature,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
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
import type { AxiosResponse } from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import z from "zod";
import { FormDate, FormSelect } from "../components/forms/FormBase";
import { WasteForm, type Schema } from "../components/forms/WasteForm";
import type { WasteModel } from "../interfaces/Models";
import { fetchCategories as fcat } from "../services/api/categories";
import { getEcoOrganisms } from "../services/api/ecoOrganism";
import {
  createWaste,
  deleteWaste,
  getWastes,
  getWasteStats,
  updateWaste,
  type wasteFilter,
} from "../services/api/wasteDisposal";

const WasteManagement = () => {

  // États pour les dialogues
  const [disposalDialog, setDisposalDialog] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState<WasteModel | null>(null);
 

  // // États pour la pagination
  // const [pagination, setPagination] = useState({
  //   page: 1,
  //   limit: 20,
  //   total: 0,
  //   totalPages: 0,
  // });

  const fitlterSchema = z.object({
    category_id: z.coerce.number(),
    disposal_type: z.string(),
    date_from: z.coerce.date(),
    date_to: z.coerce.date()
  })
  type FitlerSchema = z.infer<typeof fitlterSchema>

  const form = useForm({
    defaultValues: {
      category_id: "",
      disposal_type: "",
      date_from: new Date(),
      date_to: new Date()
    },
    resolver: zodResolver(fitlterSchema)
  })

  const filters = form.watch()


  const queryClient = useQueryClient()
  const categories = useQuery({
    queryKey: ["categories", {
      only_category: true,
      include: "category",
      out: true,
    }],
    queryFn: () => fcat({
      only_category: true,
      include: "category",
      out: true,
    }).then(response => response.data.categories)
  })

  const ecoOrganisms = useQuery({
    queryKey: ["ecoOrganisms", { active: true }],
    queryFn: () => getEcoOrganisms({ active: true }).then(response => response.data.eco_organisms)
  })

  const disposals = useQuery({
    queryKey: ["disposals", { filters }],
    queryFn: () => {
      const o: FitlerSchema = Object.fromEntries(Object.entries(filters).filter(([_, v]) => !!v));
      return getWastes(o).then(response => response.data.disposals)
    },
    placeholderData: keepPreviousData
  })

  const stats = useQuery({
    queryKey: ["wasteStats"],
    queryFn: () => getWasteStats().then(response => response.data.stats)
  })


  const addWaste = useMutation({
    mutationFn: (data: Schema) => createWaste(data),
    onSuccess: (data, variables) => {
      save(data, variables)
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  })
  const editWaste = useMutation({
    mutationFn: (data: { id: number, data: Schema }) => updateWaste(data.id, data.data),
    onSuccess: (data, variables) => {
      save(data, variables.data)
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  })
  const save = (data: AxiosResponse<{
    message: string;
  }, unknown, object>, variables: Schema) => {
    toast.success(
      editingDisposal?.id
        ? "Sortie de déchets mise à jour avec succès"
        : "Sortie de déchets créée avec succès",
    );
    handleCloseDisposalDialog();
    queryClient.invalidateQueries({ queryKey: ["wasteStats"] })
    queryClient.invalidateQueries({ queryKey: ["disposals"] })

  }
  const removeWaste = useMutation({
    mutationFn: (id: number) => deleteWaste(id),
    onSuccess: () => {
      toast.success("Sortie de déchets supprimée avec succès");
      queryClient.invalidateQueries({ queryKey: ["wasteStats"] })
      queryClient.invalidateQueries({ queryKey: ["disposals"] })
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  })
  
  const handleOpenDisposalDialog = (disposal: WasteModel | null = null) => {
    setEditingDisposal(disposal);
    setDisposalDialog(true);
  };

  const handleCloseDisposalDialog = () => {
    setDisposalDialog(false);
    setEditingDisposal(null);
  };

  const handleSaveDisposal = async (data: Schema) => {
    if (editingDisposal?.id) {
      editWaste.mutate({ id: editingDisposal.id, data })
    } else {
      addWaste.mutate(data)
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


  const getDisposalTypeLabel = (type:string) => {
    const types = {
      eco_organism: "Éco-organisme",
      landfill: "Déchetterie",
      other: "Autre",
    }as const;
    return types[type as keyof typeof types] || type;
  };

  const getDisposalTypeColor = (type:string) => {
    const colors = {
      eco_organism: "success",
      landfill: "warning",
      other: "default",
    }as const ;
    return colors[type as keyof typeof colors] || "default";
  };

  const formatWeight = (weight: NonNullable<WasteModel["weight_kg"]>) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(2)} t`;
    }
    return `${weight} kg`;
  };



  if (categories.isLoading || disposals.isLoading || stats.isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>
        🗑️ Gestion des Déchets
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          marginBottom: "16px",
        }}
      >
        Suivez et gérez les sorties de déchets vers les éco-organismes et
        déchetteries
      </Typography>
      {/* Statistiques */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Total Sorties
                    </Typography>
                    <Typography variant="h4">
                      {stats.data?.total_disposals || 0}
                    </Typography>
                  </Box>
                  <Assessment color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Poids Total
                    </Typography>
                    <Typography variant="h4">
                      {formatWeight(stats.data?.total_weight_kg || 0)}
                    </Typography>
                  </Box>
                  <TrendingUp color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Éco-organismes
                    </Typography>
                    <Typography variant="h4">
                      {stats.data?.eco_organism_disposals || 0}
                    </Typography>
                  </Box>
                  <Nature color="success" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Déchetterie
                    </Typography>
                    <Typography variant="h4">
                      {stats.data?.landfill_disposals || 0}
                    </Typography>
                  </Box>
                  <DeleteSweep color="warning" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
      {/* Actions et filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">📋 Liste des Sorties de Déchets</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDisposalDialog()}
          >
            Nouvelle Sortie
          </Button>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>

            <FormSelect control={form.control} name="category_id" label="Catégorie" extra={{ size: "small" }}>
              <MenuItem key="default" value="">Toutes</MenuItem>
              {categories.data?.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormSelect control={form.control} name="disposal_type" label="Type" extra={{ size: "small" }}>
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="eco_organism">Éco-organisme</MenuItem>
              <MenuItem value="landfill">Déchetterie</MenuItem>
              <MenuItem value="other">Autre</MenuItem>
            </FormSelect>
          
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormDate control={form.control} name="date_from" label="Date début" extra={{ slotProps: { textField: { size: "small" } } }} />
          
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormDate control={form.control} name="date_to" label="Date fin" extra={{ slotProps: { textField: { size: "small" } } }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              type="reset"
              startIcon={<FilterList />}
              onClick={() => form.reset()}
            >
              Effacer
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Table des sorties de déchets */}
      <Paper>
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
      </Paper>
      {/* Dialogue de création/modification */}
      <Dialog
        open={disposalDialog}
        onClose={handleCloseDisposalDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingDisposal
            ? "Modifier la Sortie de Déchets"
            : "Nouvelle Sortie de Déchets"}
        </DialogTitle>
        <DialogContent>
          <WasteForm
            formId="wasteForm"
            defaultValues={editingDisposal}
            onSubmit={handleSaveDisposal}
            categories={categories.data || []}
            ecoOrganisms={ecoOrganisms.data || []}
            onWeightFieldClick={() => { }}
          />
         
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisposalDialog}>Annuler</Button>
          <Button type="submit" form="wasteForm" variant="contained">
            {editingDisposal ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WasteManagement;
