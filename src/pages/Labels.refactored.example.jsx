/**
 * REFACTORED VERSION - Example showing how to use services
 * 
 * This file demonstrates how Labels.jsx would look after extracting logic to services.
 * Compare this with the original Labels.jsx to see the improvements.
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Switch,
} from '@mui/material';
import {
  Add,
  QrCode,
  Print,
  Edit,
  Delete,
  Search,
  FilterList,
  Scale,
  Euro,
  PointOfSale,
} from '@mui/icons-material';
import NumericKeypad from '../components/NumericKeypad';
import { StatCardNoIcon } from '../components/StatCard';

// ✅ Import services instead of direct API calls and business logic
import { useLabels } from '../services/useLabels';
import { printLabel } from '../services/labelPrintingService';
import { formatTotalValue } from '../services/labelStatisticsService';
import { getSubcategoriesForCategory } from '../services/categoryService';

const Labels = () => {
  // ✅ Use the custom hook that encapsulates all data fetching and CRUD operations
  const {
    items,
    categories,
    loading,
    fetchItems,
    fetchCategories,
    createItem,
    updateItem,
    deleteItem,
    markAsSold,
    getStatistics,
  } = useLabels();

  // Local UI state only
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showWeightKeypad, setShowWeightKeypad] = useState(false);
  const [showPriceKeypad, setShowPriceKeypad] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    search: ''
  });

  const [formData, setFormData] = useState({
    description: '',
    category_id: '',
    subcategory_id: '',
    weight: '',
    price: '',
    cost: '',
    condition_state: 'good',
    location: '',
    autoPrint: false,
  });

  // Constants (could also be moved to a constants file)
  const conditionOptions = [
    { value: 'excellent', label: 'Excellent', color: 'success' },
    { value: 'good', label: 'Bon état', color: 'primary' },
    { value: 'fair', label: 'État correct', color: 'warning' },
    { value: 'poor', label: 'Mauvais état', color: 'error' },
  ];

  const statusOptions = [
    { value: 'available', label: 'Disponible', color: 'success' },
    { value: 'reserved', label: 'Réservé', color: 'warning' },
    { value: 'sold', label: 'Vendu', color: 'error' },
  ];

  // ✅ Simplified data fetching - service handles the complexity
  useEffect(() => {
    fetchItems(filters);
    fetchCategories();
  }, [filters]);

  // ✅ Simplified handlers - services handle validation and API calls
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'category_id' ? { subcategory_id: '' } : {})
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      description: '',
      category_id: '',
      subcategory_id: '',
      weight: '',
      price: '',
      cost: '',
      condition_state: 'good',
      location: '',
      autoPrint: false,
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        description: item.description || '',
        category_id: item.category_id || '',
        subcategory_id: item.subcategory_id || '',
        weight: item.weight || '',
        price: item.price || '',
        cost: item.cost || '',
        condition_state: item.condition_state || 'good',
        location: item.location || '',
        autoPrint: false,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  // ✅ Simplified save handler - service handles validation and API calls
  const handleSave = async () => {
    try {
      let savedItem;
      if (editingItem) {
        savedItem = await updateItem(editingItem.id, formData);
      } else {
        savedItem = await createItem(formData);
      }

      // Auto-print if enabled
      if (formData.autoPrint && savedItem) {
        setTimeout(() => {
          printLabel(savedItem, conditionOptions);
        }, 500);
      }

      handleCloseDialog();
      fetchItems(filters);
    } catch (error) {
      // Error handling is done in the service
    }
  };

  // ✅ Simplified delete handler
  const handleDelete = async (id) => {
    try {
      await deleteItem(id);
      fetchItems(filters);
    } catch (error) {
      // Error handling is done in the service
    }
  };

  // ✅ Simplified sell handler
  const handleSell = async (id) => {
    try {
      await markAsSold(id);
      fetchItems(filters);
    } catch (error) {
      // Error handling is done in the service
    }
  };

  // ✅ Use service for printing
  const handlePrint = (item) => {
    printLabel(item, conditionOptions);
  };

  // ✅ Get statistics from service
  const statistics = getStatistics();
  const selectedCategory = categories.find(cat => cat.id == formData.category_id);

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

      {/* ✅ Statistics using service */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon 
            title='Articles disponibles' 
            value={statistics.available} 
            color="primary" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon 
            title='Articles vendus' 
            value={statistics.sold} 
            color="success.main" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon 
            title='Articles réservés' 
            value={statistics.reserved} 
            color="warning" 
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon 
            title='Valeur totale stock' 
            value={formatTotalValue(statistics.totalValue)} 
            color="info" 
          />
        </Grid>
      </Grid>

      {/* Filters */}
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
                <MenuItem value="">Tous</MenuItem>
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
                <MenuItem value="">Toutes</MenuItem>
                {categories.filter(cat => !cat.parent_id).map(category => (
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
              onClick={() => setFilters({ status: '', category_id: '', search: '' })}
            >
              Réinitialiser
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Aucun article trouvé
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {item.barcode}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {item.category_name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {item.subcategory_name || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.weight ? `${item.weight} kg` : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {parseFloat(item.price).toFixed(2)} €
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
                        <IconButton size="small" onClick={() => handlePrint(item)}>
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

      {/* Dialog - same as before but using service helpers */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Modifier l\'article' : 'Nouvel article'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Form fields remain the same */}
            {/* ... rest of form ... */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Numeric keypads - same as before */}
      {/* ... */}
    </Container>
  );
};

export default Labels;
