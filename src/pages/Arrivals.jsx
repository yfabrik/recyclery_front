import {
  Add,
  Business,
  CalendarToday,
  Category,
  Clear,
  Home,
  Inventory,
  LocalShipping,
  LocationOn,
  Save,
  Scale,
  TouchApp,
  Visibility,
  VolunteerActivism
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
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
  Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import NumericKeypad from '../components/NumericKeypad';
import { useAuth } from '../contexts/AuthContext';

const Arrivals = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showKeypad, setShowKeypad] = useState(false);

  // Fermer le pavé numérique avec Échap
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showKeypad) {
        setShowKeypad(false);
      }
    };

    if (showKeypad) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showKeypad]);
  const [formData, setFormData] = useState({
    category_id: '',
    subcategory_id: '',
    weight: '',
    arrival_date: new Date().toISOString().split('T')[0],
    arrival_time: new Date().toTimeString().slice(0,5),
    source_type: '',
    source_details: '',
    collection_point_id: '',
    collection_point_name: '',
    collection_point_address: '',
    volunteer_donation: false,
    house_clearance: false,
    notes: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchCollectionPoints();
    fetchTodaysArrivals();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Organiser les catégories comme dans la page d'administration
      const allCategories = response.data.categories || [];
      const mainCategories = allCategories.filter(cat => !cat.parent_id);
      const subcategories = allCategories.filter(cat => cat.parent_id);
      
      const organizedCategories = mainCategories.map(category => ({
        ...category,
        subcategories: subcategories.filter(sub => sub.parent_id === category.id)
      }));
      
      setCategories(organizedCategories);
    } catch (error) {
      toast.error('Erreur lors du chargement des catégories');
      console.error('Erreur:', error);
    }
  };

  const fetchCollectionPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/collection-points', {
        headers: { Authorization: `Bearer ${token}` },
        params: { active_only: 'true' }
      });
      setCollectionPoints(response.data.collection_points || []);
    } catch (error) {
      console.error('Erreur lors du chargement des points de collecte:', error);
    }
  };

  const fetchTodaysArrivals = async () => {
    try {
      const token = localStorage.getItem('token');
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get('/api/arrivals', {
        headers: { Authorization: `Bearer ${token}` },
        params: { date_from: today, date_to: today }
      });
      setArrivals(response.data.arrivals || []);
    } catch (error) {
      console.error('Erreur lors du chargement des arrivages:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si on change la catégorie, reset la sous-catégorie
    if (field === 'category_id') {
      setFormData(prev => ({
        ...prev,
        subcategory_id: ''
      }));
    }

    // Si on change le type de source, reset les champs associés
    if (field === 'source_type') {
      setFormData(prev => ({
        ...prev,
        collection_point_id: '',
        collection_point_name: '',
        collection_point_address: '',
        volunteer_donation: false,
        house_clearance: false,
        source_details: ''
      }));
    }

    // Si on sélectionne un point de collecte, remplir automatiquement
    if (field === 'collection_point_id' && value) {
      const selectedPoint = collectionPoints.find(p => p.id === value);
      if (selectedPoint) {
        setFormData(prev => ({
          ...prev,
          collection_point_name: selectedPoint.name,
          collection_point_address: `${selectedPoint.address}, ${selectedPoint.city}`
        }));
      }
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.category_id || !formData.weight || !formData.source_type) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (parseFloat(formData.weight) <= 0) {
      toast.error('Le poids doit être supérieur à 0');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Préparer les données selon le type de source
      let payload = { ...formData };
      
      if (formData.source_type === 'collection_point' && !formData.collection_point_id) {
        toast.error('Veuillez sélectionner un point de collecte');
        setLoading(false);
        return;
      }

      if (formData.source_type === 'volunteer_donation') {
        payload.volunteer_donation = true;
        payload.source_details = 'Apport volontaire sur site';
      }

      if (formData.source_type === 'house_clearance') {
        payload.house_clearance = true;
        payload.source_details = 'Vide maison';
      }

      const response = await axios.post('/api/arrivals', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(`Arrivage ${response.data.arrival.arrival_number} enregistré avec succès`);
        
        // Reset du formulaire
        setFormData({
          category_id: '',
          subcategory_id: '',
          weight: '',
          arrival_date: new Date().toISOString().split('T')[0],
          arrival_time: new Date().toTimeString().slice(0,5),
          source_type: '',
          source_details: '',
          collection_point_id: '',
          collection_point_name: '',
          collection_point_address: '',
          volunteer_donation: false,
          house_clearance: false,
          notes: ''
        });

        // Rafraîchir la liste
        fetchTodaysArrivals();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      category_id: '',
      subcategory_id: '',
      weight: '',
      arrival_date: new Date().toISOString().split('T')[0],
      arrival_time: new Date().toTimeString().slice(0,5),
      source_type: '',
      source_details: '',
      collection_point_id: '',
      collection_point_name: '',
      collection_point_address: '',
      volunteer_donation: false,
      house_clearance: false,
      notes: ''
    });
  };

  const getSelectedCategory = () => {
    return categories.find(cat => cat.id === formData.category_id);
  };

  const getSubcategories = () => {
    const selectedCategory = getSelectedCategory();
    return selectedCategory ? selectedCategory.subcategories || [] : [];
  };

  const getSourceTypeLabel = (type) => {
    const types = {
      'collection_point': 'Point de Collecte',
      'volunteer_donation': 'Apport Volontaire',
      'house_clearance': 'Vide Maison'
    };
    return types[type] || type;
  };

  const getSourceTypeIcon = (type) => {
    const icons = {
      'collection_point': <LocalShipping />,
      'volunteer_donation': <VolunteerActivism />,
      'house_clearance': <Home />
    };
    return icons[type] || <Business />;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, minHeight: '100vh' }}>
      {/* En-tête avec interface tactile */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
              Saisie des Arrivages
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Interface tactile pour l'enregistrement des arrivages
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant={showForm ? 'contained' : 'outlined'}
              onClick={() => {
                setShowForm(true);
                setShowHistory(false);
              }}
              startIcon={<TouchApp />}
              size="large"
            >
              Saisie
            </Button>
            <Button
              variant={showHistory ? 'contained' : 'outlined'}
              onClick={() => {
                setShowHistory(true);
                setShowForm(false);
              }}
              startIcon={<Visibility />}
              size="large"
            >
              Historique ({arrivals.length})
            </Button>
          </Box>
        </Box>
      </Paper>

      {showForm && (
        <Grid container spacing={3}>
          {/* Formulaire principal */}
          <Grid size={{ xs: 12, lg: 8 }} >
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Add color="primary" />
                Nouvel Arrivage
              </Typography>

              <Grid container spacing={3}>
                {/* Catégorie */}
                <Grid  size={{ xs: 12, md: 6}}>
                  <FormControl fullWidth required>
                    <InputLabel>Catégorie</InputLabel>
                    <Select
                      value={formData.category_id}
                      onChange={(e) => handleInputChange('category_id', e.target.value)}
                      label="Catégorie"
                      sx={{ fontSize: '1.1rem', minHeight: 56 }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Category />
                            {category.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Sous-catégorie */}
                <Grid size={{ xs: 12, md: 6}}>
                  <FormControl fullWidth disabled={!formData.category_id}>
                    <InputLabel>Sous-catégorie</InputLabel>
                    <Select
                      value={formData.subcategory_id}
                      onChange={(e) => handleInputChange('subcategory_id', e.target.value)}
                      label="Sous-catégorie"
                      sx={{ fontSize: '1.1rem', minHeight: 56 }}
                    >
                      <MenuItem value="">Aucune</MenuItem>
                      {getSubcategories().map((subcategory) => (
                        <MenuItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Poids */}
                <Grid size={{ xs: 12, md: 6}}>
                  <TextField
                    fullWidth
                    required
                    label="Poids (kg)"
                    value={formData.weight}
                    onClick={() => setShowKeypad(true)}
                    InputProps={{
                      startAdornment: <Scale sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: <TouchApp sx={{ ml: 1, color: 'primary.main' }} />,
                      readOnly: true,
                    }}
                    sx={{ 
                      '& .MuiInputBase-input': { 
                        fontSize: '1.2rem', 
                        padding: '16px 14px',
                        cursor: 'pointer',
                        backgroundColor: '#f8f9fa'
                      },
                      '& .MuiInputBase-root:hover': {
                        backgroundColor: '#e3f2fd'
                      }
                    }}
                    placeholder="Cliquez pour saisir le poids"
                  />
                </Grid>

                {/* Date et heure */}
                <Grid size={{ xs: 6, md: 3}}>
                  <TextField
                    fullWidth
                    required
                    label="Date"
                    type="date"
                    value={formData.arrival_date}
                    onChange={(e) => handleInputChange('arrival_date', e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                    sx={{ 
                      '& .MuiInputBase-input': { fontSize: '1.1rem', padding: '16px 14px' }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 3}}>
                  <TextField
                    fullWidth
                    label="Heure"
                    type="time"
                    value={formData.arrival_time}
                    onChange={(e) => handleInputChange('arrival_time', e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ 
                      '& .MuiInputBase-input': { fontSize: '1.1rem', padding: '16px 14px' }
                    }}
                  />
                </Grid>

                {/* Type de source */}
                <Grid size={{xs:12}}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Provenance
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { value: 'collection_point', label: 'Point de Collecte', icon: <LocalShipping /> },
                      { value: 'volunteer_donation', label: 'Apport Volontaire', icon: <VolunteerActivism /> },
                      { value: 'house_clearance', label: 'Vide Maison', icon: <Home /> }
                    ].map((source) => (
                      <Grid size={{xs:12,md:4}} key={source.value}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            border: formData.source_type === source.value ? '2px solid #1976d2' : '1px solid #e0e0e0',
                            backgroundColor: formData.source_type === source.value ? '#e3f2fd' : 'white',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                            minHeight: 100
                          }}
                          onClick={() => handleInputChange('source_type', source.value)}
                        >
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ color: formData.source_type === source.value ? '#1976d2' : 'text.secondary', mb: 1 }}>
                              {source.icon}
                            </Box>
                            <Typography variant="body1" fontWeight={formData.source_type === source.value ? 'bold' : 'normal'}>
                              {source.label}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Détails selon le type de source */}
                {formData.source_type === 'collection_point' && (
                  <Grid size={{xs:12}}>
                    <FormControl fullWidth required>
                      <InputLabel>Point de Collecte</InputLabel>
                      <Select
                        value={formData.collection_point_id}
                        onChange={(e) => handleInputChange('collection_point_id', e.target.value)}
                        label="Point de Collecte"
                        sx={{ fontSize: '1.1rem', minHeight: 56 }}
                      >
                        {collectionPoints.map((point) => (
                          <MenuItem key={point.id} value={point.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn />
                              <Box>
                                <Typography variant="body1">{point.name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {point.city}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {(formData.source_type === 'volunteer_donation' || formData.source_type === 'house_clearance') && (
                  <Grid size={{xs:12}}>
                    <TextField
                      fullWidth
                      label="Détails supplémentaires"
                      value={formData.source_details}
                      onChange={(e) => handleInputChange('source_details', e.target.value)}
                      multiline
                      rows={2}
                      placeholder="Informations complémentaires sur la provenance..."
                      sx={{ 
                        '& .MuiInputBase-input': { fontSize: '1.1rem' }
                      }}
                    />
                  </Grid>
                )}

                {/* Notes */}
                <Grid size={{xs:12}}>
                  <TextField
                    fullWidth
                    label="Notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    multiline
                    rows={3}
                    placeholder="Observations, état des objets, remarques..."
                    sx={{ 
                      '& .MuiInputBase-input': { fontSize: '1.1rem' }
                    }}
                  />
                </Grid>
              </Grid>

              {/* Boutons d'action */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleClear}
                  startIcon={<Clear />}
                  sx={{ minWidth: 150, fontSize: '1.1rem' }}
                >
                  Effacer
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading || !formData.category_id || !formData.weight || !formData.source_type}
                  startIcon={<Save />}
                  sx={{ minWidth: 200, fontSize: '1.1rem' }}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </Box>
            </Paper>
          </Grid>


          {/* Résumé de la journée */}
          <Grid  size={{xs:12,lg:4}} >
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Résumé du jour
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Nombre d'arrivages:</Typography>
                <Chip label={arrivals.length} color="primary" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography>Poids total:</Typography>
                <Chip 
                  label={`${arrivals.reduce((sum, arr) => sum + parseFloat(arr.weight || 0), 0).toFixed(1)} kg`} 
                  color="secondary" 
                />
              </Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Par provenance:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Points de collecte:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {arrivals.filter(arr => arr.source_type === 'collection_point').length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Apports volontaires:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {arrivals.filter(arr => arr.volunteer_donation).length}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Vides maison:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {arrivals.filter(arr => arr.house_clearance).length}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Aperçu formulaire */}
            {(formData.category_id || formData.weight) && (
              <Paper sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom>
                  Aperçu
                </Typography>
                {formData.category_id && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">Catégorie:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {getSelectedCategory()?.name}
                    </Typography>
                  </Box>
                )}
                {formData.weight && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">Poids:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formData.weight} kg
                    </Typography>
                  </Box>
                )}
                {formData.source_type && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">Provenance:</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {getSourceTypeLabel(formData.source_type)}
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      {showHistory && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Arrivages du jour ({new Date().toLocaleDateString('fr-FR')})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Arrivage</TableCell>
                  <TableCell>Heure</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Poids</TableCell>
                  <TableCell>Provenance</TableCell>
                  <TableCell>Saisi par</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arrivals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">
                        Aucun arrivage enregistré aujourd'hui
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  arrivals.map((arrival) => (
                    <TableRow key={arrival.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {arrival.arrival_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{arrival.arrival_time}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{arrival.category_name}</Typography>
                          {arrival.subcategory_name && (
                            <Typography variant="caption" color="textSecondary">
                              {arrival.subcategory_name}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={`${arrival.weight} kg`} 
                          size="small" 
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getSourceTypeIcon(arrival.source_type)}
                          <Box>
                            <Typography variant="body2">
                              {getSourceTypeLabel(arrival.source_type)}
                            </Typography>
                            {arrival.collection_point_name && (
                              <Typography variant="caption" color="textSecondary">
                                {arrival.collection_point_name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {arrival.processed_by_name || 'Inconnu'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Modale du pavé numérique */}
      <Dialog 
        open={showKeypad} 
        onClose={() => setShowKeypad(false)}
        maxWidth="xs"
        fullWidth
        TransitionProps={{
          timeout: 300
        }}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            backgroundColor: 'background.paper',
            overflow: 'visible',
            transform: showKeypad ? 'scale(1)' : 'scale(0.9)',
            transition: 'transform 0.2s ease-out'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          pb: 1,
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'primary.main'
        }}>
          Saisie du poids
        </DialogTitle>
        <DialogContent sx={{ p: 2, pt: 0 }}>
          <NumericKeypad
            value={formData.weight || '0'}
            onChange={(value) => handleInputChange('weight', value)}
            onClose={() => setShowKeypad(false)}
            maxValue={9999}
            decimalPlaces={1}
            unit="kg"
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Arrivals;
