import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  Phone,
  Email,
  Business,
  Visibility,
  Schedule,
  Sync,
  CheckCircle,
  Cancel,
  AccessTime,
  CalendarToday,
  Refresh,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

const CollectionPointsTab = () => {
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [recycleries, setRecycleries] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États pour les onglets et présence
  const [tabValue, setTabValue] = useState(0);
  const [presenceData, setPresenceData] = useState([]);
  const [presenceLoading, setPresenceLoading] = useState(false);
  const [presenceDialogOpen, setPresenceDialogOpen] = useState(false);
  const [editingPresence, setEditingPresence] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    type: 'standard',
    notes: '',
    is_active: true,
    recyclery_id: null,
  });

  const [presenceFormData, setPresenceFormData] = useState({
    collection_point_id: '',
    date: '',
    start_time: '',
    end_time: '',
    employee_name: '',
    notes: '',
    is_present: true,
  });

  useEffect(() => {
    fetchCollectionPoints();
    fetchRecycleries();
    fetchPresenceData();
  }, []);

  const fetchCollectionPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/collection-points', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCollectionPoints(response.data.collection_points || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des points de collecte');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecycleries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/recycleries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecycleries(response.data.recycleries || []);
    } catch (error) {
      console.error('Erreur lors du chargement des recycleries:', error);
    }
  };

  const handleOpenDialog = (point = null) => {
    if (point) {
      setEditingPoint(point);
      setFormData({
        name: point.name || '',
        address: point.address || '',
        city: point.city || '',
        postal_code: point.postal_code || '',
        contact_person: point.contact_person || '',
        contact_phone: point.contact_phone || '',
        contact_email: point.contact_email || '',
        type: point.type || 'standard',
        notes: point.notes || '',
        is_active: point.is_active !== undefined ? Boolean(point.is_active) : true,
        recyclery_id: point.recyclery_id || null,
      });
    } else {
      setEditingPoint(null);
      setFormData({
        name: '',
        address: '',
        city: '',
        postal_code: '',
        contact_person: '',
        contact_phone: '',
        contact_email: '',
        type: 'standard',
        notes: '',
        is_active: true,
        recyclery_id: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPoint(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingPoint) {
        await axios.put(`/api/collection-points/${editingPoint.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Point de collecte mis à jour avec succès');
      } else {
        await axios.post('/api/collection-points', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Point de collecte créé avec succès');
      }
      
      handleCloseDialog();
      fetchCollectionPoints();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (point) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${point.name}" ?`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/collection-points/${point.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Point de collecte supprimé avec succès');
        fetchCollectionPoints();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'standard': 'Standard',
      'enterprise': 'Entreprise',
      'association': 'Association',
      'school': 'École',
      'hospital': 'Hôpital',
      'other': 'Autre'
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      'standard': 'default',
      'enterprise': 'primary',
      'association': 'secondary',
      'school': 'success',
      'hospital': 'warning',
      'other': 'info'
    };
    return colors[type] || 'default';
  };

  // Fonctions pour gérer la présence
  const fetchPresenceData = async () => {
    try {
      setPresenceLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/collection-point-presence', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPresenceData(response.data.presence || []);
    } catch (error) {
      console.error('Erreur lors du chargement de la présence:', error);
      toast.error('Erreur lors du chargement de la présence');
    } finally {
      setPresenceLoading(false);
    }
  };

  const handleOpenPresenceDialog = (presence = null) => {
    if (presence) {
      setEditingPresence(presence);
      setPresenceFormData({
        collection_point_id: presence.collection_point_id,
        date: presence.date,
        start_time: presence.start_time,
        end_time: presence.end_time,
        employee_name: presence.employee_name,
        notes: presence.notes,
        is_present: presence.is_present,
      });
    } else {
      setEditingPresence(null);
      setPresenceFormData({
        collection_point_id: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        employee_name: '',
        notes: '',
        is_present: true,
      });
    }
    setPresenceDialogOpen(true);
  };

  const handleClosePresenceDialog = () => {
    setPresenceDialogOpen(false);
    setEditingPresence(null);
    setPresenceFormData({
      collection_point_id: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '17:00',
      employee_name: '',
      notes: '',
      is_present: true,
    });
  };

  const handlePresenceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPresenceFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSavePresence = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingPresence) {
        await axios.put(`/api/collection-point-presence/${editingPresence.id}`, presenceFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Présence mise à jour avec succès');
      } else {
        await axios.post('/api/collection-point-presence', presenceFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Présence créée avec succès');
      }
      
      handleClosePresenceDialog();
      fetchPresenceData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la présence:', error);
      toast.error('Erreur lors de la sauvegarde de la présence');
    }
  };

  const handleDeletePresence = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette présence ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/collection-point-presence/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Présence supprimée avec succès');
        fetchPresenceData();
      } catch (error) {
        console.error('Erreur lors de la suppression de la présence:', error);
        toast.error('Erreur lors de la suppression de la présence');
      }
    }
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Gestion des Points de Collecte ({collectionPoints.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Point
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Liste des Points" icon={<LocationOn />} iconPosition="start" />
        <Tab label="Présence Points" icon={<Schedule />} iconPosition="start" />
      </Tabs>

      {/* Contenu des onglets */}
      {tabValue === 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collectionPoints.map((point) => (
              <TableRow key={point.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn color="primary" fontSize="small" />
                    <Typography variant="subtitle2">{point.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {point.address}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {point.city} {point.postal_code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getTypeLabel(point.type)} 
                    color={getTypeColor(point.type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {point.contact_person && (
                    <Typography variant="body2">{point.contact_person}</Typography>
                  )}
                  {point.contact_phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone fontSize="small" />
                      <Typography variant="caption">{point.contact_phone}</Typography>
                    </Box>
                  )}
                  {point.contact_email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Email fontSize="small" />
                      <Typography variant="caption">{point.contact_email}</Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={point.is_active ? 'Actif' : 'Inactif'} 
                    color={point.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpenDialog(point)} 
                    color="primary"
                    size="small"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(point)} 
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog de création/édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPoint ? 'Modifier le Point de Collecte' : 'Nouveau Point de Collecte'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du point"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Type"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="enterprise">Entreprise</MenuItem>
                  <MenuItem value="association">Association</MenuItem>
                  <MenuItem value="school">École</MenuItem>
                  <MenuItem value="hospital">Hôpital</MenuItem>
                  <MenuItem value="other">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Adresse"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Ville"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Code postal"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Personne de contact"
                name="contact_person"
                value={formData.contact_person}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Téléphone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Recyclerie</InputLabel>
                <Select
                  name="recyclery_id"
                  value={formData.recyclery_id || ''}
                  onChange={handleInputChange}
                  label="Recyclerie"
                >
                  <MenuItem value="">Aucune</MenuItem>
                  {recycleries.map((recyclery) => (
                    <MenuItem key={recyclery.id} value={recyclery.id}>
                      {recyclery.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    name="is_active"
                  />
                }
                label="Point actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.address || !formData.city || !formData.postal_code}
          >
            {editingPoint ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
        </>
      )}

      {/* Onglet Présence Points */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Présence aux Points de Collecte
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenPresenceDialog()}
            >
              Ajouter une présence
            </Button>
          </Box>

          {presenceLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : presenceData.length === 0 ? (
            <Alert severity="info">
              Aucune présence enregistrée. Cliquez sur "Ajouter une présence" pour commencer.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Point de Collecte</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Heures</TableCell>
                    <TableCell>Employé</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {presenceData.map((presence) => (
                    <TableRow key={presence.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="primary" fontSize="small" />
                          <Typography variant="body2">
                            {collectionPoints.find(cp => cp.id === presence.collection_point_id)?.name || 'Point inconnu'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(presence.date).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {presence.start_time} - {presence.end_time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {presence.employee_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={presence.is_present ? 'Présent' : 'Absent'}
                          color={presence.is_present ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenPresenceDialog(presence)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeletePresence(presence.id)}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Dialog de création/édition de présence */}
      <Dialog open={presenceDialogOpen} onClose={handleClosePresenceDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            {editingPresence ? 'Modifier la présence' : 'Nouvelle présence'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Point de Collecte</InputLabel>
                <Select
                  name="collection_point_id"
                  value={presenceFormData.collection_point_id}
                  onChange={handlePresenceInputChange}
                  label="Point de Collecte"
                >
                  {collectionPoints.map(point => (
                    <MenuItem key={point.id} value={point.id}>
                      {point.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={presenceFormData.date}
                onChange={handlePresenceInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Heure de début"
                name="start_time"
                type="time"
                value={presenceFormData.start_time}
                onChange={handlePresenceInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Heure de fin"
                name="end_time"
                type="time"
                value={presenceFormData.end_time}
                onChange={handlePresenceInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nom de l'employé"
                name="employee_name"
                value={presenceFormData.employee_name}
                onChange={handlePresenceInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={presenceFormData.is_present}
                    onChange={handlePresenceInputChange}
                    name="is_present"
                  />
                }
                label="Présent"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (optionnel)"
                name="notes"
                multiline
                rows={3}
                value={presenceFormData.notes}
                onChange={handlePresenceInputChange}
                placeholder="Ex: Collecte exceptionnelle, problème technique..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePresenceDialog}>Annuler</Button>
          <Button onClick={handleSavePresence} variant="contained">
            {editingPresence ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollectionPointsTab;
