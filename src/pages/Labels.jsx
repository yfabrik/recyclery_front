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
  Typography
} from '@mui/material';
import JsBarcode from 'jsbarcode';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import NumericKeypad from '../components/NumericKeypad';
import { useAuth } from '../contexts/AuthContext';

import { StatCardNoIcon } from '../components/StatCard';
import { LabeledItemForm } from '../components/forms/LabeledItemForm';
import { fetchCategories as fcat } from '../services/api/categories';
import { createLabeledItem, deleteLabeledItem, getLabeledItems, sellItem, updateLabeledItem } from '../services/api/labeledItems';

const Labels = () => {
  // const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showWeightKeypad, setShowWeightKeypad] = useState(false);
  const [showPriceKeypad, setShowPriceKeypad] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    search: ''
  });

  // const [formData, setFormData] = useState({
  //   description: '',
  //   category_id: '',
  //   subcategory_id: '',
  //   weight: '',
  //   price: '',
  //   cost: '',
  //   condition_state: 'good',
  //   location: '',
  //   autoPrint: false,
  // });

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

  // Charger les données initiales
  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, [filters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters.status) params.append('status', filters.status);
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.search) params.append('search', filters.search);

      const response = await getLabeledItems(params)

      setItems(response.data.items || []);
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      toast.error('Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // const token = localStorage.getItem('token');
      const response = await fcat({ only_category: true, include: "category" })
      // await axios.get('/api/categories', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // Organiser les catégories comme dans les autres pages
      // const allCategories = response.data.categories || [];
      // const mainCategories = allCategories.filter(cat => !cat.parent_id);
      // const subcategories = allCategories.filter(cat => cat.parent_id);

      // const organizedCategories = mainCategories.map(category => ({
      //   ...category,
      //   subcategories: subcategories.filter(sub => sub.parent_id === category.id)
      // }));

      setCategories(response.data.categories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  // const handleInputChange = (field, value) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     [field]: value,
  //     // Réinitialiser la sous-catégorie si la catégorie change
  //     ...(field === 'category_id' ? { subcategory_id: '' } : {})
  //   }));
  // };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // const resetForm = () => {
  //   setFormData({
  //     description: '',
  //     category_id: '',
  //     subcategory_id: '',
  //     weight: '',
  //     price: '',
  //     cost: '',
  //     condition_state: 'good',
  //     location: '',
  //     autoPrint: false,
  //   });
  //   setEditingItem(null);
  // };

  const handleOpenDialog = (item = null) => {
    setEditingItem(item);

    // if (item) {
    //   setEditingItem(item);
    //   setFormData({
    //     description: item.description || '',
    //     category_id: item.category_id || '',
    //     subcategory_id: item.subcategory_id || '',
    //     weight: item.weight || '',
    //     price: item.price || '',
    //     cost: item.cost || '',
    //     condition_state: item.condition_state || 'good',
    //     location: item.location || '',
    //     autoPrint: false, // Par défaut désactivé pour la modification
    //   });
    // } else {
    //   resetForm();
    // }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    // resetForm();
  };

  const handleSave = async (data) => {
    try {

      let savedItem = null;

      if (editingItem?.id) {
        // Mise à jour

        const response = await updateLabeledItem(editingItem.id, data)
        savedItem = response.data.item;
        toast.success('Article mis à jour avec succès');
      } else {
        // Création
        const response = await createLabeledItem(data)
        savedItem = response.data.item;
        toast.success('Article créé avec succès');
      }

      // Impression automatique si activée
      if (data.autoPrint && savedItem) {
        setTimeout(() => {
          printLabel(savedItem);
        }, 500); // Petit délai pour s'assurer que l'article est bien créé
      }

      handleCloseDialog();
      fetchItems();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      await deleteLabeledItem(id)
      toast.success('Article supprimé avec succès');
      fetchItems();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSell = async (id) => {
    if (!window.confirm('Marquer cet article comme vendu ?')) {
      return;
    }

    try {

      await sellItem(id)

      toast.success('Article marqué comme vendu');
      fetchItems();
    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      toast.error('Erreur lors de la vente');
    }
  };

  const generateBarcode = (barcode) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, barcode, {
      format: "CODE128",
      width: 1.5,
      height: 50,
      displayValue: true,
      fontSize: 10
    });
    return canvas.toDataURL();
  };

  const printLabel = (item) => {
    const barcodeImage = generateBarcode(item.barcode);

    const printWindow = window.open('', '', 'width=400,height=200');
    printWindow.document.write(`
      <html>
        <head>
          <title>Étiquette - ${item.barcode}</title>
          <style>
            @page {
              size: 60mm 40mm;
              margin: 0;
              padding: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 2mm;
              width: 60mm;
              height: 40mm;
              overflow: hidden;
            }
            .label {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
            }
            .barcode { 
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
              margin-bottom: 1mm;
            }
            .barcode img {
              max-width: 100%;
              max-height: 70%;
              object-fit: contain;
            }
            .info-row {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 8px;
              margin-top: 0.5mm;
            }
            .price { 
              font-size: 10px; 
              font-weight: bold; 
              color: #d32f2f;
            }
            .weight { 
              font-size: 8px;
            }
            .category { 
              width: 100%;
              text-align: center;
              font-size: 7px; 
              color: #666;
              margin-top: 0.3mm;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="barcode">
              <img src="${barcodeImage}" alt="Code-barres" />
            </div>
            <div class="info-row">
              <div class="price">${parseFloat(item.price).toFixed(2)} €</div>
              ${item.weight ? `<div class="weight">${item.weight} kg</div>` : '<div></div>'}
            </div>
            <div class="category">${item.category_name || item?.category?.name || ''}${item.subcategory_name || item?.subcategory?.name ? ' > ' + (item.subcategory_name || item?.subcategory?.name) : ''}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    // Wait a bit for the image to load before printing
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // const selectedCategory = categories.find(cat => cat.id == formData.category_id);

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
          <StatCardNoIcon title='Articles disponibles' value={items.filter(item => item.status === 'available').length} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon title='Articles vendus' value={items.filter(item => item.status === 'sold').length} color="success.main" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon title='Articles réservés' value={items.filter(item => item.status === 'reserved').length} color="warning" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCardNoIcon title='Valeur totale stock' value={` ${items.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)} €`} color="info" />
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
          <LabeledItemForm formId='labelItemForm' categories={categories} onSubmit={handleSave} defaultValues={editingItem} />
        </DialogContent>
        {/* <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Catégories</InputLabel>
                <Select
                  value={formData.category_id}
                  label="Catégories"
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                >
                  {categories.filter(cat => !cat.parent_id).map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Sous-catégories</InputLabel>
                <Select
                  value={formData.subcategory_id}
                  label="Sous-catégories"
                  onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                  disabled={!formData.category_id}
                >
                  <MenuItem value="">Aucune</MenuItem>
                  {categories.find(cat => cat.id === formData.category_id)?.subcategories?.map(subcategory => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Poids (kg)"
                value={formData.weight}
                onClick={() => setShowWeightKeypad(true)}
                sx={{
                  '& .MuiInputBase-input': {
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa'
                  }
                }}
                placeholder="Cliquez pour saisir"
                slotProps={{
                  input: {
                    startAdornment: <Scale sx={{ mr: 1, color: 'text.secondary' }} />,
                    readOnly: true,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="Prix de vente (€)"
                value={formData.price}
                onClick={() => setShowPriceKeypad(true)}
                sx={{
                  '& .MuiInputBase-input': {
                    cursor: 'pointer',
                    backgroundColor: '#f8f9fa'
                  }
                }}
                placeholder="Cliquez pour saisir"
                slotProps={{
                  input: {
                    startAdornment: <Euro sx={{ mr: 1, color: 'text.secondary' }} />,
                    readOnly: true,
                  }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>État</InputLabel>
                <Select
                  value={formData.condition_state}
                  label="État"
                  onChange={(e) => handleInputChange('condition_state', e.target.value)}
                >
                  {conditionOptions.map(condition => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Emplacement"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ex: Rayon A, Étagère 2"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description détaillée de l'article..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: 1,
                border: '1px solid #e0e0e0'
              }}>
                <Print sx={{ color: 'primary.main' }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight="medium">
                    Impression automatique
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Imprimer l'étiquette automatiquement après la sauvegarde
                  </Typography>
                </Box>
                <Switch
                  checked={formData.autoPrint}
                  onChange={(e) => handleInputChange('autoPrint', e.target.checked)}
                  color="primary"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent> */}
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type='submit' form='labelItemForm' variant="contained">
            {editingItem ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modale pavé numérique pour le poids */}
      {/* <Dialog open={showWeightKeypad} onClose={() => setShowWeightKeypad(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>Saisie du poids</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <NumericKeypad
            value={'0'}
            onChange={(value) => handleInputChange('weight', value)}
            onClose={() => setShowWeightKeypad(false)}
            maxValue={9999}
            decimalPlaces={1}
            unit="kg"
          />
        </DialogContent>
      </Dialog> */}
      {/* Modale pavé numérique pour le prix */}
      {/* <Dialog open={showPriceKeypad} onClose={() => setShowPriceKeypad(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>Saisie du prix</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <NumericKeypad
            value={'0'}
            onChange={(value) => handleInputChange('price', value)}
            onClose={() => setShowPriceKeypad(false)}
            maxValue={99999}
            decimalPlaces={2}
            unit="€"
          />
        </DialogContent>
      </Dialog> */}
    </Container>
  );
};

export default Labels;
