import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Store,
  Person,
  Phone,
  Email,
  LocationOn,
  AccountBalance,
  AccessTime,
  Schedule,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { createCaisse, createStore, deleteStore, fetchCaisses, updateStore,fetchStores as fStore } from '../../../services/api/store';
import { createStoreHours, deleteStoreHours, updateStoreHours,fetchStoreHours as fStoreHours } from '../../../services/api/storeHours';
import { fetchUsers as fUsers } from '../../../services/api/users';

const StoresTab = () => {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [cashRegistersDialog, setCashRegistersDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [cashRegisters, setCashRegisters] = useState([]);
  const [newCashRegisterName, setNewCashRegisterName] = useState('');
  
  // États pour les onglets et horaires
  const [tabValue, setTabValue] = useState(0);
  const [storeHours, setStoreHours] = useState([]);
  const [hoursDialogOpen, setHoursDialogOpen] = useState(false);
  const [editingHours, setEditingHours] = useState(null);
  const [hoursLoading, setHoursLoading] = useState(false);
  
  // États pour les lieux
  const [locations, setLocations] = useState([]);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    email: '',
    manager_id: '',
    is_active: true,
  });

  const [hoursFormData, setHoursFormData] = useState({
    store_id: '',
    day_of_week: '',
    time_slot_name: 'Ouverture',
    is_open: true,
    open_time: '09:00',
    close_time: '18:00',
    is_24h: false,
    notes: ''
  });

  const daysOfWeek = [
    { value: 'monday', label: 'Lundi' },
    { value: 'tuesday', label: 'Mardi' },
    { value: 'wednesday', label: 'Mercredi' },
    { value: 'thursday', label: 'Jeudi' },
    { value: 'friday', label: 'Vendredi' },
    { value: 'saturday', label: 'Samedi' },
    { value: 'sunday', label: 'Dimanche' }
  ];

  const [locationFormData, setLocationFormData] = useState({
    name: '',
    description: '',
    store_id: '',
    is_active: true,
  });

  useEffect(() => {
    fetchStores();
    fetchUsers();
    fetchStoreHours();
    fetchLocations();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fStore()
      // await axios.get('/api/stores', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setStores(response.data.stores || []);
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      toast.error('Erreur lors du chargement des magasins');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response =await fUsers()
      //  await axios.get('/api/users', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // Filtrer pour ne garder que les managers et admins
      const managers = (response.data.users || []).filter(user => 
        user.role === 'manager' || user.role === 'admin'
      );
      setUsers(managers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const fetchStoreHours = async () => {
    try {
      setHoursLoading(true);
      const token = localStorage.getItem('token');
      const response =await fStoreHours()
      //  await axios.get('/api/store-hours', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setStoreHours(response.data.storeHours || []);
    } catch (error) {
      console.error('Erreur lors du chargement des horaires:', error);
      toast.error('Erreur lors du chargement des horaires');
    } finally {
      setHoursLoading(false);
    }
  };

  const fetchCashRegisters = async (storeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetchCaisses(storeId)
      //  await axios.get(`/api/stores/${storeId}/cash-registers`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setCashRegisters(response.data.cash_registers || []);
    } catch (error) {
      console.error('Erreur lors du chargement des caisses:', error);
      toast.error('Erreur lors du chargement des caisses');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      postal_code: '',
      phone: '',
      email: '',
      manager_id: '',
      is_active: true,
    });
    setEditingStore(null);
  };

  const handleOpenDialog = (store = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name || '',
        address: store.address || '',
        city: store.city || '',
        postal_code: store.postal_code || '',
        phone: store.phone || '',
        email: store.email || '',
        manager_id: store.manager_id || '',
        is_active: store.is_active || true,
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

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast.error('Le nom du magasin est obligatoire');
        return;
      }

      const token = localStorage.getItem('token');
      
      if (editingStore) {
        // Mise à jour
        await updateStore(editingStore.id,formData)
        // await axios.put(`/api/stores/${editingStore.id}`, formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Magasin mis à jour avec succès');
      } else {
        // Création
        await createStore(formData)
        // await axios.post('/api/stores', formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Magasin créé avec succès');
      }
      
      handleCloseDialog();
      fetchStores();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce magasin ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await deleteStore(id)
      // await axios.delete(`/api/stores/${id}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      toast.success('Magasin supprimé avec succès');
      fetchStores();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleOpenCashRegisters = (store) => {
    setSelectedStore(store);
    fetchCashRegisters(store.id);
    setCashRegistersDialog(true);
  };

  const handleCloseCashRegisters = () => {
    setCashRegistersDialog(false);
    setSelectedStore(null);
    setCashRegisters([]);
    setNewCashRegisterName('');
  };

  const handleAddCashRegister = async () => {
    if (!newCashRegisterName.trim()) {
      toast.error('Le nom de la caisse est obligatoire');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await createCaisse(selectedStore.id,{name:newCashRegisterName})
      // await axios.post(`/api/stores/${selectedStore.id}/cash-registers`, {
      //   name: newCashRegisterName
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      toast.success('Caisse créée avec succès');
      setNewCashRegisterName('');
      fetchCashRegisters(selectedStore.id);
    } catch (error) {
      console.error('Erreur lors de la création de la caisse:', error);
      toast.error('Erreur lors de la création de la caisse');
    }
  };

  // Fonctions pour gérer les horaires d'ouverture
  const handleOpenHoursDialog = (hours = null, storeId = null) => {
    if (hours) {
      setEditingHours(hours);
      setHoursFormData({
        store_id: hours.store_id,
        day_of_week: hours.day_of_week,
        time_slot_name: hours.time_slot_name || 'Ouverture',
        is_open: hours.is_open,
        open_time: hours.open_time || '09:00',
        close_time: hours.close_time || '18:00',
        is_24h: hours.is_24h || false,
        notes: hours.notes || ''
      });
    } else {
      setEditingHours(null);
      setHoursFormData({
        store_id: storeId || '',
        day_of_week: '',
        time_slot_name: 'Ouverture',
        is_open: true,
        open_time: '09:00',
        close_time: '18:00',
        is_24h: false,
        notes: ''
      });
    }
    setHoursDialogOpen(true);
  };

  const handleCloseHoursDialog = () => {
    setHoursDialogOpen(false);
    setEditingHours(null);
    setHoursFormData({
      store_id: '',
      day_of_week: '',
      time_slot_name: 'Ouverture',
      is_open: true,
      open_time: '09:00',
      close_time: '18:00',
      is_24h: false,
      notes: ''
    });
  };

  const handleHoursInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHoursFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveHours = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingHours) {
        await updateStoreHours(editingHours.id,hoursFormData)
        // await axios.put(`/api/store-hours/${editingHours.id}`, hoursFormData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Horaires mis à jour avec succès');
      } else {
        await createStoreHours(hoursFormData)
        // await axios.post('/api/store-hours', hoursFormData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Horaires créés avec succès');
      }
      
      handleCloseHoursDialog();
      fetchStoreHours();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des horaires:', error);
      toast.error('Erreur lors de la sauvegarde des horaires');
    }
  };

  const handleDeleteHours = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ces horaires ?')) {
      try {
        const token = localStorage.getItem('token');
        await deleteStoreHours(id)
        // await axios.delete(`/api/store-hours/${id}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Horaires supprimés avec succès');
        fetchStoreHours();
      } catch (error) {
        console.error('Erreur lors de la suppression des horaires:', error);
        toast.error('Erreur lors de la suppression des horaires');
      }
    }
  };

  // Fonctions pour gérer les lieux
  const fetchLocations = async () => {
    try {
      setLocationLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/store-locations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Erreur lors du chargement des lieux:', error);
      toast.error('Erreur lors du chargement des lieux');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleOpenLocationDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationFormData({
        name: location.name,
        description: location.description,
        store_id: location.store_id,
        is_active: location.is_active,
      });
    } else {
      setEditingLocation(null);
      setLocationFormData({
        name: '',
        description: '',
        store_id: '',
        is_active: true,
      });
    }
    setLocationDialogOpen(true);
  };

  const handleCloseLocationDialog = () => {
    setLocationDialogOpen(false);
    setEditingLocation(null);
    setLocationFormData({
      name: '',
      description: '',
      store_id: '',
      is_active: true,
    });
  };

  const handleLocationInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocationFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' || type === 'switch' ? checked : value
    }));
  };

  const handleSaveLocation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (editingLocation) {
        await axios.put(`/api/store-locations/${editingLocation.id}`, locationFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Lieu mis à jour avec succès');
      } else {
        await axios.post('/api/store-locations', locationFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Lieu créé avec succès');
      }
      
      handleCloseLocationDialog();
      fetchLocations();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du lieu:', error);
      toast.error('Erreur lors de la sauvegarde du lieu');
    }
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/store-locations/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Lieu supprimé avec succès');
        fetchLocations();
      } catch (error) {
        console.error('Erreur lors de la suppression du lieu:', error);
        toast.error('Erreur lors de la suppression du lieu');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Gestion des Magasins
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau Magasin
        </Button>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Liste des Magasins" icon={<Store />} iconPosition="start" />
        <Tab label="Horaires d'Ouverture" icon={<AccessTime />} iconPosition="start" />
        <Tab label="Lieux" icon={<LocationOn />} iconPosition="start" />
      </Tabs>

      {/* Contenu des onglets */}
      {tabValue === 0 && (
        <>
          {/* Statistiques rapides */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12,sm:4}}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stores.length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Magasins total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12,sm:4}}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stores.filter(store => store.is_active).length}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Magasins actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12,sm:4}}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stores.reduce((sum, store) => sum + (store.cash_registers_count || 0), 0)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Caisses total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table des magasins */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Magasin</TableCell>
              <TableCell>Manager</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Caisses</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : stores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Aucun magasin trouvé
                </TableCell>
              </TableRow>
            ) : (
              stores.map((store) => (
                <TableRow key={store.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store color="primary" />
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {store.name}
                        </Typography>
                        {store.address && (
                          <Typography variant="body2" color="textSecondary">
                            {store.address}
                            {store.city && `, ${store.city}`}
                            {store.postal_code && ` ${store.postal_code}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {store.manager_name ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        {store.manager_name}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Non assigné
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      {store.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Phone fontSize="small" />
                          <Typography variant="body2">{store.phone}</Typography>
                        </Box>
                      )}
                      {store.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email fontSize="small" />
                          <Typography variant="body2">{store.email}</Typography>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AccountBalance />}
                      onClick={() => handleOpenCashRegisters(store)}
                    >
                      {store.cash_registers_count || 0} caisse(s)
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={store.is_active ? 'Actif' : 'Inactif'}
                      color={store.is_active ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => handleOpenDialog(store)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" color="error" onClick={() => handleDelete(store.id)}>
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

      {/* Dialog de création/édition de magasin */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingStore ? 'Modifier le magasin' : 'Nouveau magasin'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size = {{xs:12 ,md:6}} >
              <TextField
                fullWidth
                required
                label="Nom du magasin"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </Grid>
            <Grid size = {{xs:12 ,md:6}} >
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={formData.manager_id}
                  label="Manager"
                  onChange={(e) => handleInputChange('manager_id', e.target.value)}
                >
                  <MenuItem value="">Aucun</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.username} ({user.role})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size = {{xs:12 }} >
              <TextField
                fullWidth
                label="Adresse"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </Grid>
            
            <Grid size = {{xs:12 ,md:6}} >
              <TextField
                fullWidth
                label="Ville"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </Grid>
            
            <Grid size = {{xs:12 ,md:6}} >
              <TextField
                fullWidth
                label="Code postal"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
              />
            </Grid>
            
            <Grid size = {{xs:12 ,md:6}} >
              <TextField
                fullWidth
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </Grid>
            
            <Grid size = {{xs:12 ,md:6}} >
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </Grid>

            <Grid size = {{xs:12 ,md:6}} >
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.is_active}
                  label="Statut"
                  onChange={(e) => handleInputChange('is_active', e.target.value)}
                >
                  <MenuItem value={true}>Actif</MenuItem>
                  <MenuItem value={false}>Inactif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            {editingStore ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de gestion des caisses */}
      <Dialog open={cashRegistersDialog} onClose={handleCloseCashRegisters} maxWidth="sm" fullWidth>
        <DialogTitle>
          Caisses - {selectedStore?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Nom de la nouvelle caisse"
              value={newCashRegisterName}
              onChange={(e) => setNewCashRegisterName(e.target.value)}
              InputProps={{
                endAdornment: (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddCashRegister}
                    disabled={!newCashRegisterName.trim()}
                  >
                    Ajouter
                  </Button>
                )
              }}
            />
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Sessions</TableCell>
                  <TableCell>Dernière utilisation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cashRegisters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Aucune caisse
                    </TableCell>
                  </TableRow>
                ) : (
                  cashRegisters.map((register) => (
                    <TableRow key={register.id}>
                      <TableCell>{register.name}</TableCell>
                      <TableCell>{register.sessions_count || 0}</TableCell>
                      <TableCell>
                        {register.last_session_date ? 
                          new Date(register.last_session_date).toLocaleDateString() : 
                          'Jamais'
                        }
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCashRegisters}>Fermer</Button>
        </DialogActions>
      </Dialog>
        </>
      )}

      {/* Onglet Horaires d'ouverture */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Horaires d'ouverture des magasins
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenHoursDialog()}
            >
              Ajouter des horaires
            </Button>
          </Box>

          {hoursLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : storeHours.length === 0 ? (
            <Alert severity="info">
              Aucun horaire d'ouverture configuré. Cliquez sur "Ajouter des horaires" pour commencer.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {Object.entries(
                storeHours.reduce((acc, hours) => {
                  if (!acc[hours.store_id]) {
                    acc[hours.store_id] = [];
                  }
                  acc[hours.store_id].push(hours);
                  return acc;
                }, {})
              ).map(([storeId, hours]) => (
                <Grid size={{ xs: 12, md: 6}} key={storeId}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Store color="primary" />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {stores.find(s => s.id === parseInt(storeId))?.name || 'Magasin inconnu'}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => handleOpenHoursDialog(null, parseInt(storeId))}
                        >
                          Ajouter
                        </Button>
                      </Box>
                      
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Jour</TableCell>
                              <TableCell>Statut</TableCell>
                              <TableCell>Horaires</TableCell>
                              <TableCell>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {hours
                              .sort((a, b) => daysOfWeek.findIndex(d => d.value === a.day_of_week) - 
                                           daysOfWeek.findIndex(d => d.value === b.day_of_week))
                              .map((hour) => (
                              <TableRow key={hour.id}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {daysOfWeek.find(d => d.value === hour.day_of_week)?.label || hour.day_of_week}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {!hour.is_open ? (
                                    <Chip label="Fermé" color="error" size="small" />
                                  ) : hour.is_24h ? (
                                    <Chip label="24h/24" color="success" size="small" />
                                  ) : (
                                    <Chip label="Ouvert" color="success" size="small" />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {!hour.is_open ? 'Fermé' : hour.is_24h ? '24h/24' : `${hour.open_time} - ${hour.close_time}`}
                                  </Typography>
                                  {hour.notes && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {hour.notes}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenHoursDialog(hour)}
                                    color="primary"
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteHours(hour.id)}
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
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Onglet Lieux */}
      {tabValue === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Gestion des Lieux dans les Magasins
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenLocationDialog()}
            >
              Nouveau Lieu
            </Button>
          </Box>

          {locationLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : locations.length === 0 ? (
            <Alert severity="info">
              Aucun lieu configuré. Cliquez sur "Nouveau Lieu" pour commencer.
            </Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nom du Lieu</TableCell>
                    <TableCell>Magasin</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn color="primary" fontSize="small" />
                          <Typography variant="body1" fontWeight="medium">
                            {location.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {stores.find(store => store.id === location.store_id)?.name || 'Magasin inconnu'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {location.description || 'Aucune description'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={location.is_active ? 'Actif' : 'Inactif'}
                          color={location.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenLocationDialog(location)}
                          color="primary"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteLocation(location.id)}
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

      {/* Dialog de création/édition des lieux */}
      <Dialog open={locationDialogOpen} onClose={handleCloseLocationDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn />
            {editingLocation ? 'Modifier le lieu' : 'Nouveau lieu'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                required
                label="Nom du lieu"
                name="name"
                value={locationFormData.name}
                onChange={handleLocationInputChange}
                placeholder="Ex: Caisse principale, Entrepôt, Bureau..."
              />
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <FormControl fullWidth required>
                <InputLabel>Magasin</InputLabel>
                <Select
                  name="store_id"
                  value={locationFormData.store_id}
                  onChange={handleLocationInputChange}
                  label="Magasin"
                >
                  {stores.map(store => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12}}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={locationFormData.description}
                onChange={handleLocationInputChange}
                placeholder="Ex: Zone de stockage des articles électroniques, Point de vente principal..."
              />
            </Grid>
            <Grid size={{ xs: 12}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={locationFormData.is_active}
                    onChange={(e) => {
                      setLocationFormData(prev => ({
                        ...prev,
                        is_active: e.target.checked
                      }));
                    }}
                  />
                }
                label="Lieu actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLocationDialog}>Annuler</Button>
          <Button onClick={handleSaveLocation} variant="contained">
            {editingLocation ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de création/édition des horaires */}
      <Dialog open={hoursDialogOpen} onClose={handleCloseHoursDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            {editingHours ? 'Modifier les horaires' : 'Nouveaux horaires'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12,sm:6}}>
              <FormControl fullWidth required>
                <InputLabel>Magasin</InputLabel>
                <Select
                  name="store_id"
                  value={hoursFormData.store_id}
                  onChange={handleHoursInputChange}
                  label="Magasin"
                >
                  {stores.map(store => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <FormControl fullWidth required>
                <InputLabel>Jour de la semaine</InputLabel>
                <Select
                  name="day_of_week"
                  value={hoursFormData.day_of_week}
                  onChange={handleHoursInputChange}
                  label="Jour de la semaine"
                >
                  {daysOfWeek.map(day => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={hoursFormData.is_open}
                    onChange={handleHoursInputChange}
                    name="is_open"
                  />
                }
                label="Magasin ouvert ce jour"
              />
            </Grid>

            {hoursFormData.is_open && (
              <>
                <Grid size={{ xs: 12}}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={hoursFormData.is_24h}
                        onChange={handleHoursInputChange}
                        name="is_24h"
                      />
                    }
                    label="Ouvert 24h/24"
                  />
                </Grid>

                {!hoursFormData.is_24h && (
                  <>
                    <Grid size={{ xs: 12,sm:6}}>
                      <TextField
                        fullWidth
                        label="Heure d'ouverture"
                        name="open_time"
                        type="time"
                        value={hoursFormData.open_time}
                        onChange={handleHoursInputChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12,sm:6}}>
                      <TextField
                        fullWidth
                        label="Heure de fermeture"
                        name="close_time"
                        type="time"
                        value={hoursFormData.close_time}
                        onChange={handleHoursInputChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}

            <Grid size={{ xs: 12}}>
              <TextField
                fullWidth
                label="Notes (optionnel)"
                name="notes"
                multiline
                rows={3}
                value={hoursFormData.notes}
                onChange={handleHoursInputChange}
                placeholder="Ex: Pause déjeuner de 12h à 14h, fermeture exceptionnelle..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHoursDialog}>Annuler</Button>
          <Button onClick={handleSaveHours} variant="contained">
            {editingHours ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoresTab;
