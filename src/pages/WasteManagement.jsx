import {
  Add,
  Assessment,
  Delete,
  DeleteSweep,
  Edit,
  FilterList,
  Nature,
  TrendingUp
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
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import NumericKeypad from "../components/NumericKeypad";
import {
  fetchCategories as fcat,
  getSubcategories,
} from "../services/api/categories";
import { getEcoOrganisms } from "../services/api/ecoOrganism";
import {
  createWaste,
  deleteWaste,
  getWastes,
  getWasteStats,
  updateWaste,
} from "../services/api/wasteDisposal";

const WasteManagement = () => {
  // États principaux
  const [disposals, setDisposals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [ecoOrganisms, setEcoOrganisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // États pour les dialogues
  const [disposalDialog, setDisposalDialog] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState(null);
  const [showWeightKeypad, setShowWeightKeypad] = useState(false);
  const [disposalForm, setDisposalForm] = useState({
    disposal_date: new Date().toISOString().split("T")[0],
    category_id: "",
    subcategory_id: "",
    eco_organism_id: "",
    disposal_type: "eco_organism",
    weight_kg: "",
    volume_m3: "",
    transport_method: "",
    transport_company: "",
    transport_cost: "",
    notes: "",
  });

  // États pour les filtres
  const [filters, setFilters] = useState({
    category_id: "",
    subcategory_id: "",
    eco_organism_id: "",
    disposal_type: "",
    date_from: "",
    date_to: "",
  });

  // États pour la pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Charger les données initiales
  useEffect(() => {
    fetchData();
  }, []);

  // Charger les données avec filtres
  useEffect(() => {
    fetchDisposals();
  }, [filters, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
        fetchEcoOrganisms(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fcat();
      //  await axios.get('/api/categories');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fcat({only_sub:true});
      // await axios.get('/api/subcategories');
      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.error("Erreur lors du chargement des sous-catégories:", error);
    }
  };

  const fetchEcoOrganisms = async () => {
    try {
      const response = await getEcoOrganisms({active:1})
      setEcoOrganisms(response.data.eco_organisms || []);
    } catch (error) {
      console.error("Erreur lors du chargement des éco-organismes:", error);
    }
  };

  const fetchDisposals = async () => {
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await getWastes(params);
      // await axios.get(`/api/waste-disposals?${params}`);
      setDisposals(response.data.disposals || []);
      setPagination(response.data.pagination || pagination);
    } catch (error) {
      console.error("Erreur lors du chargement des sorties de déchets:", error);
      toast.error("Erreur lors du chargement des sorties de déchets");
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getWasteStats();
      // await axios.get('/api/waste-disposals/stats/summary');
      setStats(response.data.stats);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleOpenDisposalDialog = (disposal = null) => {
    if (disposal) {
      setEditingDisposal(disposal);
      setDisposalForm({
        disposal_date: disposal.disposal_date,
        category_id: disposal.category_id || "",
        subcategory_id: disposal.subcategory_id || "",
        eco_organism_id: disposal.eco_organism_id || "",
        disposal_type: disposal.disposal_type,
        weight_kg: disposal.weight_kg,
        volume_m3: disposal.volume_m3 || "",
        transport_method: disposal.transport_method || "",
        transport_company: disposal.transport_company || "",
        transport_cost: disposal.transport_cost || "",
        notes: disposal.notes || "",
      });
    } else {
      setEditingDisposal(null);
      setDisposalForm({
        disposal_date: new Date().toISOString().split("T")[0],
        category_id: "",
        subcategory_id: "",
        eco_organism_id: "",
        disposal_type: "eco_organism",
        weight_kg: "",
        volume_m3: "",
        transport_method: "",
        transport_company: "",
        transport_cost: "",
        notes: "",
      });
    }
    setDisposalDialog(true);
  };

  const handleCloseDisposalDialog = () => {
    setDisposalDialog(false);
    setEditingDisposal(null);
  };

  const handleSaveDisposal = async () => {
    try {
      const url = editingDisposal
        ? await updateWaste(disposalForm)
        : await createWaste(disposalForm);
      //
      // ? `/api/waste-disposals/${editingDisposal.id}`
      // : '/api/waste-disposals';

      // const method = editingDisposal ? 'put' : 'post';

      // console.log('Données envoyées:', disposalForm);
      // await axios[method](url, disposalForm);

      toast.success(
        editingDisposal
          ? "Sortie de déchets mise à jour avec succès"
          : "Sortie de déchets créée avec succès"
      );

      handleCloseDisposalDialog();
      fetchDisposals();
      fetchStats();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handleDeleteDisposal = async (id) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette sortie de déchets ?"
      )
    ) {
      return;
    }

    try {
      await deleteWaste(id)
      // await axios.delete(`/api/waste-disposals/${id}`);
      toast.success("Sortie de déchets supprimée avec succès");
      fetchDisposals();
      fetchStats();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const getDisposalTypeLabel = (type) => {
    const types = {
      eco_organism: "Éco-organisme",
      landfill: "Déchetterie",
      other: "Autre",
    };
    return types[type] || type;
  };

  const getDisposalTypeColor = (type) => {
    const colors = {
      eco_organism: "success",
      landfill: "warning",
      other: "default",
    };
    return colors[type] || "default";
  };

  const formatWeight = (weight) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(2)} t`;
    }
    return `${weight} kg`;
  };

  if (loading) {
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
      <Typography variant="body1" color="text.secondary" sx={{
        marginBottom: "16px"
      }}>
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
                      {stats.total_disposals || 0}
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
                      {formatWeight(stats.total_weight_kg || 0)}
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
                      {stats.eco_organism_disposals || 0}
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
                      {stats.landfill_disposals || 0}
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
            <FormControl fullWidth size="small">
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={filters.category_id}
                onChange={(e) =>
                  handleFilterChange("category_id", e.target.value)
                }
              >
                <MenuItem value="">Toutes</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.disposal_type}
                onChange={(e) =>
                  handleFilterChange("disposal_type", e.target.value)
                }
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="eco_organism">Éco-organisme</MenuItem>
                <MenuItem value="landfill">Déchetterie</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Date début"
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              label="Date fin"
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() =>
                setFilters({
                  category_id: "",
                  subcategory_id: "",
                  eco_organism_id: "",
                  disposal_type: "",
                  date_from: "",
                  date_to: "",
                })
              }
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
              {disposals.map((disposal) => (
                <TableRow key={disposal.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {disposal.disposal_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(disposal.disposal_date).toLocaleDateString(
                      "fr-FR"
                    )}
                  </TableCell>
                  <TableCell>
                    {disposal.category_name || "Non spécifié"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getDisposalTypeLabel(disposal.disposal_type)}
                      color={getDisposalTypeColor(disposal.disposal_type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {disposal.eco_organism_name || "Non spécifié"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {formatWeight(disposal.weight_kg)}
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Date de sortie"
                type="date"
                value={disposalForm.disposal_date}
                onChange={(e) =>
                  setDisposalForm((prev) => ({
                    ...prev,
                    disposal_date: e.target.value,
                  }))
                }
                slotProps={{ inputLabel: { shrink: true } }}
                required
                
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel id="sortie_type">Type de sortie</InputLabel>
                <Select
                labelId="sortie_type"
                label="Type de sortie"

                  value={disposalForm.disposal_type}
                  onChange={(e) =>
                    setDisposalForm((prev) => ({
                      ...prev,
                      disposal_type: e.target.value,
                      eco_organism_id:
                        e.target.value !== "eco_organism"
                          ? ""
                          : prev.eco_organism_id,
                    }))
                  }
                >
                  <MenuItem value="eco_organism">Éco-organisme</MenuItem>
                  <MenuItem value="landfill">Déchetterie</MenuItem>
                  <MenuItem value="other">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Catégorie</InputLabel>
                <Select
                  value={disposalForm.category_id}
                  onChange={(e) =>
                    setDisposalForm((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                      subcategory_id: "", // Reset subcategory when category changes
                    }))
                  }
                >
                  <MenuItem value="">Sélectionner une catégorie</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Sous-catégorie</InputLabel>
                <Select
                  value={disposalForm.subcategory_id}
                  onChange={(e) =>
                    setDisposalForm((prev) => ({
                      ...prev,
                      subcategory_id: e.target.value,
                    }))
                  }
                  disabled={!disposalForm.category_id}
                >
                  <MenuItem value="">Sélectionner une sous-catégorie</MenuItem>
                  {subcategories
                    .filter(
                      (sub) =>
                        sub.category_id === parseInt(disposalForm.category_id)
                    )
                    .map((subcategory) => (
                      <MenuItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            {disposalForm.disposal_type === "eco_organism" && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Éco-organisme</InputLabel>
                  <Select
                    value={disposalForm.eco_organism_id}
                    onChange={(e) =>
                      setDisposalForm((prev) => ({
                        ...prev,
                        eco_organism_id: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">Sélectionner un éco-organisme</MenuItem>
                    {ecoOrganisms.map((org) => (
                      <MenuItem key={org.id} value={org.id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Poids (kg)"
                value={disposalForm.weight_kg}
                onChange={(e) =>
                  setDisposalForm((prev) => ({
                    ...prev,
                    weight_kg: e.target.value,
                  }))
                }
                onClick={() => setShowWeightKeypad(true)}
                required
                sx={{
                  cursor: "pointer",
                  "& .MuiInputBase-input": {
                    cursor: "pointer",
                  },
                }}
                slotProps={{
                  input: {
                    readOnly: true,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Volume (m³)"
                type="number"
                step="0.01"
                value={disposalForm.volume_m3}
                onChange={(e) =>
                  setDisposalForm((prev) => ({
                    ...prev,
                    volume_m3: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Méthode de transport"
                value={disposalForm.transport_method}
                onChange={(e) =>
                  setDisposalForm((prev) => ({
                    ...prev,
                    transport_method: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Entreprise de transport"
                value={disposalForm.transport_company}
                onChange={(e) =>
                  setDisposalForm((prev) => ({
                    ...prev,
                    transport_company: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Coût du transport (€)"
                type="number"
                step="0.01"
                value={disposalForm.transport_cost}
                onChange={(e) =>
                  setDisposalForm((prev) => ({
                    ...prev,
                    transport_cost: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={disposalForm.notes}
                onChange={(e) =>
                  setDisposalForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisposalDialog}>Annuler</Button>
          <Button onClick={handleSaveDisposal} variant="contained">
            {editingDisposal ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Pavé numérique pour le poids */}
      <Dialog
        open={showWeightKeypad}
        onClose={() => setShowWeightKeypad(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>Saisie du poids</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <NumericKeypad
            value={disposalForm.weight_kg || "0"}
            onChange={(value) =>
              setDisposalForm((prev) => ({ ...prev, weight_kg: value }))
            }
            onClose={() => setShowWeightKeypad(false)}
            maxValue={9999}
            decimalPlaces={1}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default WasteManagement;
