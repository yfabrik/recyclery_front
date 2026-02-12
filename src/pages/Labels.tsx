import {
  Add,
  Delete,
  Edit,
  FilterList,
  PointOfSale,
  Print,
  QrCode,
  Search
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
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
  Typography,
  type TypographyPropsColorOverrides
} from '@mui/material';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { StatCardNoIcon } from '../components/StatCard';
import { LabeledItemForm, type Schema } from '../components/forms/LabeledItemForm';
import type { LabeledItemModel } from '../interfaces/Models';
import { fetchCategories as fcat } from '../services/api/categories';
import { createLabeledItem, deleteLabeledItem, getLabeledItems, sellItem, updateLabeledItem, type itemsFilters } from '../services/api/labeledItems';
import { printLabel } from '../services/printService';

const Labels = () => {

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LabeledItemModel | null>(null);

  const [filters, setFilters] = useState<itemsFilters>({
    status: "",
    category_id: "",
    search: ""
  });


  //TODO  faut limiter pour que y'ai que 1 foix la value et ensure que la value soit presente +type color
  const conditionOptions: { value: LabeledItemModel["condition_state"], label: string, color: "success" | "primary" | "warning" | "error" | "default" | "secondary" | "info" | undefined }[] = [
    { value: 'excellent', label: 'Excellent', color: 'success' },
    { value: 'good', label: 'Bon état', color: 'primary' },
    { value: 'fair', label: 'État correct', color: 'warning' },
    { value: 'poor', label: 'Mauvais état', color: 'error' },
  ] as const;

  const statusOptions: { value: LabeledItemModel["status"], label: string, color: TypographyPropsColorOverrides }[] = [
    { value: 'available', label: 'Disponible', color: 'success' },
    { value: 'reserved', label: 'Réservé', color: 'warning' },
    { value: 'sold', label: 'Vendu', color: 'error' },
  ] as const;

  const queryClient = useQueryClient()
  const items = useQuery({
    queryKey: ["items", { filters }],
    queryFn: () => {
      const params = new URLSearchParams();

      console.log(!!filters.category_id)
      if (filters.status) params.append('status', filters.status);
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.search) params.append('search', filters.search);
      return getLabeledItems(params).then(response => response.data.items)
    }

  })
  if (items.isError) toast.error('Erreur lors du chargement des articles');

  const categories = useQuery({
    queryKey: ["categories", { only_category: true, include: "category", in: true }],
    queryFn: () => fcat({ only_category: true, include: "category", in: true }).then(response => response.data.categories)
  })

  const addItem = useMutation({
    mutationFn: (data: Schema) => createLabeledItem(data),
    onSuccess: (data, variables) => {
      saved(data, variables)
    },
    onError: () => toast.error('Erreur lors de la sauvegarde')

  })
  const editItem = useMutation({
    mutationFn: (data: { id: number, data: Schema }) => updateLabeledItem(data.id, data.data),
    onSuccess: (data, variables, context) => {
      console.log(context)
      return saved(data, variables.data)
    },
    onError: () => toast.error('Erreur lors de la sauvegarde')

  })
  const removeItem = useMutation({
    mutationFn: (id: number) => deleteLabeledItem(id),
    onSuccess: () => {
      toast.success('Article supprimé avec succès')
      queryClient.invalidateQueries({ queryKey: ["items"] })

    },
    onError: () => toast.error('Erreur lors de la suppression')

  })

  const sell = useMutation({
    mutationFn: (id: number) => sellItem(id),
    onSuccess: () => {
      toast.success('Article marqué comme vendu');
      queryClient.invalidateQueries({ queryKey: ["items"] })

    },
    onError: () => toast.error('Erreur lors de la vente')

  })

  const saved = (data: AxiosResponse<{
    success: true;
    message: string;
    item?: LabeledItemModel
  }, any, {}>, variables: Schema) => {
    if (variables.autoPrint && data.data.item) printLabel(data.data.item)

    toast.success(data.config.method == "post" ? 'Article créé avec succès' : 'Article mis à jour avec succès');
    handleCloseDialog();
    queryClient.invalidateQueries({ queryKey: ["items"] })
  }


  //TODO can do better
  const handleFilterChange = (field: keyof itemsFilters, value: itemsFilters[keyof itemsFilters]) => {

    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpenDialog = (item: LabeledItemModel | null = null) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);

  };

  const handleSave = async (data: Schema) => {
    if (editingItem?.id) editItem.mutate({ id: editingItem.id, data })
    else addItem.mutate(data)

  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }
    removeItem.mutate(id)


  };

  const handleSell = async (id: number) => {
    if (!window.confirm('Marquer cet article comme vendu ?')) {
      return;
    }
    sell.mutate(id)

  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCode color="primary" />
          Étiquetage & Codes-barres
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ minHeight: 48 }}
        >
          Nouvel Article
        </Button>
      </Box>
      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} >
          <StatCardNoIcon title='Articles disponibles' value={items.data?.filter(item => item.status === 'available').length || 0} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon title='Articles vendus' value={items.data?.filter(item => item.status === 'sold').length || 0} color="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon title='Articles réservés' value={items.data?.filter(item => item.status === 'reserved').length || 0} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon title='Valeur totale stock' value={` ${items.data?.reduce((sum, item) => sum + item.price || 0, 0).toFixed(2)} €`} color="info" />
        </Grid>
      </Grid>
      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Rechercher par nom, description ou code-barres..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.status}
                label="Statut"
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <MenuItem value={""}>Tous</MenuItem>
                {statusOptions.map(status => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={filters.category_id}
                label="Catégorie"
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
              >
                <MenuItem value={""}>Toutes</MenuItem>
                {categories.data?.filter(cat => !cat.parent_id).map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilters({ status: undefined, category_id: undefined, search: undefined })}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Table des articles */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code-barres</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Sous-catégorie</TableCell>
              <TableCell>Poids</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.isLoading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : items.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              items.data?.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {item.barcode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item?.category?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {item?.subcategory?.name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.weight ? `${item.weight} kg` : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {item.price.toFixed(2)} €
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={conditionOptions.find(c => c.value === item.condition_state)?.label}
                      color={conditionOptions.find(c => c.value === item.condition_state)?.color}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={statusOptions.find(s => s.value === item.status)?.label}
                      color={statusOptions.find(s => s.value === item.status)?.color}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Imprimer étiquette">
                        <IconButton size="small" onClick={() => printLabel(item)}>
                          <Print />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {item.status === 'available' && (
                        <Tooltip title="Marquer comme vendu">
                          <IconButton size="small" color="success" onClick={() => handleSell(item.id)}>
                            <PointOfSale />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Dialog de création/édition */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
        </DialogTitle>
        <DialogContent>
          <LabeledItemForm formId='labelItemForm' categories={categories.data || []} onSubmit={handleSave} defaultValues={editingItem} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type='submit' form='labelItemForm' variant="contained">
            {editingItem ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Labels;
