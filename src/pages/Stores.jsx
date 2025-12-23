import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Store,
  Edit,
  Delete,
  Phone,
  Email,
  LocationOn,
  Person,
  Assessment,
  AccountBalance,
  Settings,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createCaisse2, createStore, deleteCaisse, deleteStore, fetchCaisses, fetchCaisses2, fetchStores as fStore, updateCaisse, updateStore } from '../services/api/store';

const Stores = () => {
  const { user, isAdmin } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // États pour les magasins
  const [stores, setStores] = useState([]);
  
  // États pour les caisses
  const [cashRegisters, setCashRegisters] = useState([]);
  const [openCashRegisterDialog, setOpenCashRegisterDialog] = useState(false);
  const [editingCashRegister, setEditingCashRegister] = useState(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
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

  const handleOpenDialog = (store = null) => {
    setEditingStore(store);
    if (store) {
      reset(store);
    } else {
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStore(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      if (editingStore) {
        // Mise à jour
        await updateStore(editingStore.id,data)
        // await axios.put(`/api/stores/${editingStore.id}`, data, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Magasin mis à jour avec succès');
      } else {
        // Création
        await createStore(data)
        // await axios.post('/api/stores', data, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Magasin créé avec succès');
      }
      
      handleCloseDialog();
      fetchStores();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce magasin ?')) {
      return;
    }

    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      await deleteStore(storeId)
      // await axios.delete(`/api/stores/${storeId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      toast.success('Magasin supprimé avec succès');
      fetchStores();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour les caisses
  const fetchCashRegisters = async (storeId) => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      const response = await fetchCaisses2(storeId)
      //  await axios.get(`/api/cash-registers/store/${storeId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      setCashRegisters(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des caisses:', error);
      toast.error('Erreur lors du chargement des caisses');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
    fetchCashRegisters(store.id);
  };

  const handleOpenCashRegisterDialog = (cashRegister = null) => {
    setEditingCashRegister(cashRegister);
    if (cashRegister) {
      reset({
        name: cashRegister.name,
        is_active: cashRegister.is_active
      });
    } else {
      reset({
        name: '',
        is_active: true
      });
    }
    setOpenCashRegisterDialog(true);
  };

  const handleCloseCashRegisterDialog = () => {
    setOpenCashRegisterDialog(false);
    setEditingCashRegister(null);
    reset();
  };

  const onSubmitCashRegister = async (data) => {
    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      
      if (editingCashRegister) {
        // Mise à jour
        await updateCaisse(editingCashRegister.id,data)
        // await axios.put(`/api/cash-registers/${editingCashRegister.id}`, data, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Caisse mise à jour avec succès');
      } else {
        await createCaisse2({
          ...data,
          store_id: selectedStore.id
        })
        // Création
        // await axios.post('/api/cash-registers', {
        //   ...data,
        //   store_id: selectedStore.id
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Caisse créée avec succès');
      }
      
      handleCloseCashRegisterDialog();
      fetchCashRegisters(selectedStore.id);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCashRegister = async (cashRegisterId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette caisse ?')) {
      return;
    }

    try {
      setLoading(true);
      // const token = localStorage.getItem('token');
      await deleteCaisse(cashRegisterId)
      // await axios.delete(`/api/cash-registers/${cashRegisterId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      toast.success('Caisse supprimée avec succès');
      fetchCashRegisters(selectedStore.id);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gestion des Magasins
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Nouveau Magasin
          </Button>
        )}
      </Box>

      {/* Onglets */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Liste des Magasins" />
          <Tab label="Gestion des Caisses" />
        </Tabs>
      </Box>

      {/* Contenu des onglets */}
      {tabValue === 0 && (
        <Box>
          {/* Liste des magasins */}
          <Grid container spacing={3}>
            {loading ? (
              <Grid size={{ xs: 12}}>
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : stores.length === 0 ? (
              <Grid size={{ xs: 12}}>
                <Alert severity="info">
                  Aucun magasin configuré. Créez-en un pour commencer.
                </Alert>
              </Grid>
            ) : (
              stores.map((store) => (
                <Grid size={{ xs: 12, md: 6,lg:4}} key={store.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <Store />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h2">
                            {store.name}
                          </Typography>
                          <Chip 
                            label={store.is_active ? 'Actif' : 'Inactif'} 
                            color={store.is_active ? 'success' : 'default'} 
                            size="small"
                          />
                        </Box>
                      </Box>

                      <List dense>
                        {store.address && (
                          <ListItem disablePadding>
                            <ListItemAvatar>
                              <LocationOn color="action" />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={store.address}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        )}
                        
                        {store.phone && (
                          <ListItem disablePadding>
                            <ListItemAvatar>
                              <Phone color="action" />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={store.phone}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        )}
                        
                        {store.email && (
                          <ListItem disablePadding>
                            <ListItemAvatar>
                              <Email color="action" />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={store.email}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        startIcon={<AccountBalance />}
                        onClick={() => handleStoreSelect(store)}
                      >
                        Gérer les Caisses
                      </Button>
                      
                      {isAdmin && (
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(store)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(store.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          {!selectedStore ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Gestion des Caisses
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Sélectionnez un magasin pour gérer ses caisses
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {stores.map(store => (
                  <Grid key={store.id}>
                    <Card 
                      sx={{ 
                        minWidth: 200, 
                        cursor: 'pointer',
                        '&:hover': { boxShadow: 4 }
                      }}
                      onClick={() => handleStoreSelect(store)}
                    >
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Store color="primary" sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="h6">{store.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          {store.address}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ) : (
            <Box>
              {/* En-tête du magasin sélectionné */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Store color="primary" />
                    <Box>
                      <Typography variant="h6">{selectedStore.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {selectedStore.address}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => setSelectedStore(null)}
                  >
                    Changer de magasin
                  </Button>
                </Box>
              </Paper>

              {/* Liste des caisses */}
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Caisses du magasin ({cashRegisters.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenCashRegisterDialog()}
                  >
                    Nouvelle Caisse
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : cashRegisters.length === 0 ? (
                  <Alert severity="info">
                    Aucune caisse configurée pour ce magasin. Créez-en une pour pouvoir ouvrir des sessions de caisse.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nom de la caisse</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Sessions totales</TableCell>
                          <TableCell>Dernière session</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cashRegisters.map((register) => (
                          <TableRow key={register.id}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccountBalance color="action" />
                                <Typography variant="body1" fontWeight="medium">
                                  {register.name}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={register.is_active ? <CheckCircle /> : <Cancel />}
                                label={register.is_active ? 'Active' : 'Inactive'}
                                color={register.is_active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {register.total_sessions || 0}
                            </TableCell>
                            <TableCell>
                              {register.last_session 
                                ? new Date(register.last_session).toLocaleDateString('fr-FR')
                                : 'Jamais'
                              }
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenCashRegisterDialog(register)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteCashRegister(register.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          )}
        </Box>
      )}

      {/* Dialog pour créer/modifier un magasin */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingStore ? 'Modifier le magasin' : 'Nouveau magasin'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nom du magasin"
              {...register('name', {
                required: 'Le nom est requis',
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Adresse"
              multiline
              rows={2}
              {...register('address')}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Ville"
              {...register('city')}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Code postal"
              {...register('postal_code')}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Téléphone"
              {...register('phone')}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              type="email"
              {...register('email')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained" disabled={loading}>
            {loading ? 'Sauvegarde...' : (editingStore ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour créer/modifier une caisse */}
      <Dialog open={openCashRegisterDialog} onClose={handleCloseCashRegisterDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCashRegister ? 'Modifier la caisse' : 'Nouvelle caisse'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nom de la caisse"
              {...register('name', {
                required: 'Le nom est requis',
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
            />
            
            <FormControlLabel
              control={
                <Switch
                  {...register('is_active')}
                  defaultChecked={true}
                />
              }
              label="Caisse active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCashRegisterDialog}>Annuler</Button>
          <Button onClick={handleSubmit(onSubmitCashRegister)} variant="contained" disabled={loading}>
            {loading ? 'Sauvegarde...' : (editingCashRegister ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Stores;










