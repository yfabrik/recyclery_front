/**
 * @deprecated
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  AccessTime,
  Store,
  Schedule
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

import { fetchStores as fStores } from '../../../services/api/store';
import { createStoreHours, deleteStoreHours, fetchStoreHours as fStoreHours, updateStoreHours } from '../../../services/api/storeHours';
import { DAYS_OF_WEEK as daysOfWeek ,TIME_SLOTS as timeSlots} from '../../../interfaces/shared';

const StoreHoursTab = () => {
  const [stores, setStores] = useState([]);
  const [storeHours, setStoreHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingHours, setEditingHours] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportOptions, setReportOptions] = useState({
    store_id: '',
    start_date: '',
    end_date: '',
    include_notes: true,
    task_category: 'Ouverture magasin'
  });
  const [syncing, setSyncing] = useState(false);

  const [formData, setFormData] = useState({
    store_id: '',
    day_of_week: '',
    time_slot_name: 'Ouverture',
    is_open: true,
    open_time: '09:00',
    close_time: '18:00',
    is_24h: false,
    notes: ''
  });

  // const daysOfWeek = [
  //   { value: 'monday', label: 'Lundi' },
  //   { value: 'tuesday', label: 'Mardi' },
  //   { value: 'wednesday', label: 'Mercredi' },
  //   { value: 'thursday', label: 'Jeudi' },
  //   { value: 'friday', label: 'Vendredi' },
  //   { value: 'saturday', label: 'Samedi' },
  //   { value: 'sunday', label: 'Dimanche' }
  // ];

  // const timeSlots = [
  //   { value: 'Ouverture', label: 'Ouverture générale' },
  //   { value: 'Matin', label: 'Matin (9h-12h)' },
  //   { value: 'Après-midi', label: 'Après-midi (14h-18h)' },
  //   { value: 'Soirée', label: 'Soirée (18h-21h)' },
  //   { value: 'Pause déjeuner', label: 'Pause déjeuner' },
  //   { value: 'Autre', label: 'Autre créneau' }
  // ];

  useEffect(() => {
    fetchStores();
    fetchStoreHours();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fStores()
      if (response.data.success) {
        setStores(response.data.stores || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des magasins:', error);
      toast.error('Erreur lors du chargement des magasins');
    }
  };

  const fetchStoreHours = async () => {
    try {
      setLoading(true);
      const response = await fStoreHours()
      if (response.data.success) {
        setStoreHours(response.data.storeHours || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des horaires:', error);
      toast.error('Erreur lors du chargement des horaires');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hours = null) => {
    if (hours) {
      setEditingHours(hours);
      setFormData({
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
      setFormData({
        store_id: selectedStore || '',
        day_of_week: '',
        time_slot_name: 'Ouverture',
        is_open: true,
        open_time: '09:00',
        close_time: '18:00',
        is_24h: false,
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingHours(null);
    setFormData({
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

  const handleQuickTimeSlot = (slot) => {
    switch (slot) {
      case 'matin':
        setFormData(prev => ({ 
          ...prev, 
          time_slot_name: 'Matin',
          open_time: '09:00', 
          close_time: '12:00' 
        }));
        break;
      case 'apres-midi':
        setFormData(prev => ({ 
          ...prev, 
          time_slot_name: 'Après-midi',
          open_time: '14:00', 
          close_time: '18:00' 
        }));
        break;
      case 'soiree':
        setFormData(prev => ({ 
          ...prev, 
          time_slot_name: 'Soirée',
          open_time: '18:00', 
          close_time: '21:00' 
        }));
        break;
      case 'pause-dejeuner':
        setFormData(prev => ({ 
          ...prev, 
          time_slot_name: 'Pause déjeuner',
          open_time: '12:00', 
          close_time: '14:00' 
        }));
        break;
      default:
        break;
    }
  };

  const handleReportToPlanning = () => {
    setOpenReportDialog(true);
  };

  // Fonction pour synchroniser automatiquement tous les horaires d'ouverture
  const handleAutoSyncToPlanning = async () => {
    try {
      setSyncing(true);
      
      // Obtenir la date d'aujourd'hui et la fin du mois
      const today = new Date();
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = endOfMonth.toISOString().split('T')[0];
      
      console.log('🔄 AUTO SYNC: Synchronisation automatique des horaires d\'ouverture');
      console.log('📅 Période:', startDate, 'à', endDate);
      
      // Synchroniser pour chaque magasin
      const syncPromises = stores.map(async (store) => {
        try {
          const response = await axios.post('/api/store-hours/sync-to-planning', {
            store_id: store.id,
            start_date: startDate,
            end_date: endDate
          });
          
          if (response.data.success) {
            console.log(`✅ ${store.name}: ${response.data.message}`);
            console.log(`🔍 Debug ${store.name}:`, response.data.debug);
            console.log(`📊 Détails des horaires ${store.name}:`, response.data.debug.storeHoursDetails);
            response.data.debug.storeHoursDetails.forEach((hour, index) => {
              console.log(`  ${index + 1}. Jour ${hour.day}, Créneau: ${hour.slot}, ${hour.open}-${hour.close}, Ouvert: ${hour.is_open}, 24h: ${hour.is_24h}`);
            });
            return { store: store.name, success: true, tasks: response.data.tasks?.length || 0, debug: response.data.debug };
          } else {
            console.log(`❌ ${store.name}: ${response.data.message}`);
            return { store: store.name, success: false, message: response.data.message };
          }
        } catch (error) {
          console.error(`❌ Erreur pour ${store.name}:`, error);
          return { store: store.name, success: false, error: error.message };
        }
      });
      
      const results = await Promise.all(syncPromises);
      
      // Compter les succès
      const successful = results.filter(r => r.success);
      const totalTasks = successful.reduce((sum, r) => sum + (r.tasks || 0), 0);
      
      if (successful.length > 0) {
        toast.success(`✅ Synchronisation réussie ! ${totalTasks} tâches d'ouverture créées pour ${successful.length} magasin(s)`);
      } else {
        toast.warning('⚠️ Aucune tâche d\'ouverture créée. Vérifiez que les horaires sont bien configurés.');
      }
      
      // Afficher les détails dans la console
      console.log('📊 RÉSULTATS DE LA SYNCHRONISATION:', results);
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation automatique:', error);
      toast.error('Erreur lors de la synchronisation automatique');
    } finally {
      setSyncing(false);
    }
  };

  // Fonction pour synchroniser TOUS les horaires d'ouverture (plus large période)
  const handleSyncAllOpeningHours = async () => {
    try {
      setSyncing(true);
      
      // Synchroniser pour les 3 prochains mois
      const today = new Date();
      const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
      
      const startDate = today.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log('🔄 SYNC ALL: Synchronisation de TOUS les horaires d\'ouverture');
      console.log('📅 Période étendue:', startDate, 'à', endDateStr);
      
      // Synchroniser pour chaque magasin
      const syncPromises = stores.map(async (store) => {
        try {
          const response = await axios.post('/api/store-hours/sync-to-planning', {
            store_id: store.id,
            start_date: startDate,
            end_date: endDateStr
          });
          
          if (response.data.success) {
            console.log(`✅ ${store.name}: ${response.data.message}`);
            console.log(`🔍 Debug ${store.name}:`, response.data.debug);
            console.log(`📊 Détails des horaires ${store.name}:`, response.data.debug.storeHoursDetails);
            response.data.debug.storeHoursDetails.forEach((hour, index) => {
              console.log(`  ${index + 1}. Jour ${hour.day}, Créneau: ${hour.slot}, ${hour.open}-${hour.close}, Ouvert: ${hour.is_open}, 24h: ${hour.is_24h}`);
            });
            return { store: store.name, success: true, tasks: response.data.tasks?.length || 0, debug: response.data.debug };
          } else {
            console.log(`❌ ${store.name}: ${response.data.message}`);
            return { store: store.name, success: false, message: response.data.message };
          }
        } catch (error) {
          console.error(`❌ Erreur pour ${store.name}:`, error);
          return { store: store.name, success: false, error: error.message };
        }
      });
      
      const results = await Promise.all(syncPromises);
      
      // Compter les succès
      const successful = results.filter(r => r.success);
      const totalTasks = successful.reduce((sum, r) => sum + (r.tasks || 0), 0);
      
      if (successful.length > 0) {
        toast.success(`🎉 Synchronisation complète ! ${totalTasks} tâches d'ouverture créées pour ${successful.length} magasin(s) sur 3 mois`);
      } else {
        toast.warning('⚠️ Aucune tâche d\'ouverture créée. Vérifiez que les horaires sont bien configurés.');
      }
      
      // Afficher les détails dans la console
      console.log('📊 RÉSULTATS DE LA SYNCHRONISATION COMPLÈTE:', results);
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation complète:', error);
      toast.error('Erreur lors de la synchronisation complète');
    } finally {
      setSyncing(false);
    }
  };

  const handleCloseReportDialog = () => {
    setOpenReportDialog(false);
    setReportOptions({
      store_id: '',
      start_date: '',
      end_date: '',
      include_notes: true,
      task_category: 'Ouverture magasin'
    });
  };

  const handleReportOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleConfirmReport = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('❌ Token d\'authentification manquant');
        return;
      }
      
      console.log('🔄 Report to planning avec options:', reportOptions);
      
      // Validation des données
      if (!reportOptions.store_id || !reportOptions.start_date || !reportOptions.end_date) {
        toast.error('❌ Veuillez remplir tous les champs');
        return;
      }
      
      const requestData = {
        store_id: parseInt(reportOptions.store_id),
        start_date: reportOptions.start_date,
        end_date: reportOptions.end_date
      };
      
      console.log('📤 Envoi de la requête vers /api/store-hours/sync-to-planning avec:', requestData);
      
      // Utiliser la nouvelle API de synchronisation
      const response = await axios.post('/api/store-hours/sync-to-planning', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📥 Réponse reçue:', response.data);
      
      if (response.data.success) {
        toast.success(`✅ ${response.data.message}`);
        console.log('✅ Tâches créées:', response.data.tasks);
        handleCloseReportDialog();
      } else {
        toast.error(`❌ ${response.data.message}`);
      }
      
    } catch (error) {
      console.error('❌ Erreur lors du report au planning:', error);
      console.error('❌ Détails de l\'erreur:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 400) {
        toast.error(`❌ Erreur de validation: ${error.response.data?.message || 'Données invalides'}`);
      } else if (error.response?.status === 401) {
        toast.error('❌ Erreur d\'authentification');
      } else {
        toast.error(`❌ Erreur: ${error.response?.data?.message || error.message}`);
      }
    }
  };


  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return Math.round((end - start) / (1000 * 60 * 60)); // en heures
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
      
      if (editingHours) {
        // Mise à jour
        await updateStoreHours(editingHours.id,formData)
        toast.success('Horaires mis à jour avec succès');
      } else {
        // Création
        await createStoreHours(formData)
        toast.success('Horaires créés avec succès');
      }
      
      handleCloseDialog();
      fetchStoreHours();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      
      if (error.response?.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 'Données invalides';
        toast.error(`Erreur de validation: ${errorMessage}`);
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ces horaires ?')) {
      try {
        const token = localStorage.getItem('token');
        await deleteStoreHours(id)
        toast.success('Horaires supprimés avec succès');
        fetchStoreHours();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Magasin inconnu';
  };

  const getDayLabel = (day) => {
    const dayObj = daysOfWeek.find(d => d.value === day);
    return dayObj ? dayObj.label : day;
  };

  const getStatusChip = (hours) => {
    if (!hours.is_open) {
      return <Chip label="Fermé" color="error" size="small" />;
    }
    if (hours.is_24h) {
      return <Chip label="24h/24" color="success" size="small" />;
    }
    return <Chip label="Ouvert" color="success" size="small" />;
  };

  const getTimeDisplay = (hours) => {
    if (!hours.is_open) return 'Fermé';
    if (hours.is_24h) return '24h/24';
    return `${hours.open_time} - ${hours.close_time}`;
  };

  const getTimeSlotDisplay = (hours) => {
    return hours.time_slot_name || 'Ouverture';
  };

  // Grouper les horaires par magasin
  const groupedHours = storeHours.reduce((acc, hours) => {
    if (!acc[hours.store_id]) {
      acc[hours.store_id] = [];
    }
    acc[hours.store_id].push(hours);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#333' }}>
          Horaires d'ouverture des magasins
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#45a049' }
            }}
          >
            Ajouter des horaires
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            onClick={handleReportToPlanning}
            sx={{
              borderColor: '#2196f3',
              color: '#2196f3',
              '&:hover': { bgcolor: '#2196f3', color: 'white' }
            }}
          >
            Reporter au planning
          </Button>
          
          <Button
            variant="contained"
            startIcon={syncing ? <CircularProgress size={20} /> : <Schedule />}
            onClick={handleAutoSyncToPlanning}
            disabled={syncing}
            sx={{
              bgcolor: '#4caf50',
              color: 'white',
              '&:hover': { bgcolor: '#45a049' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {syncing ? 'Synchronisation...' : '🔄 Sync Auto'}
          </Button>
          
          <Button
            variant="contained"
            startIcon={syncing ? <CircularProgress size={20} /> : <Store />}
            onClick={handleSyncAllOpeningHours}
            disabled={syncing}
            sx={{
              bgcolor: '#ff9800',
              color: 'white',
              '&:hover': { bgcolor: '#f57c00' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {syncing ? 'Synchronisation...' : '🎯 Sync Tous (3 mois)'}
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : storeHours.length === 0 ? (
        <Alert severity="info">
          Aucun horaire d'ouverture configuré. Cliquez sur "Ajouter des horaires" pour commencer.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {Object.keys(groupedHours).map(storeId => (
            <Grid size={{ xs: 12, md: 6}} key={storeId}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Store color="primary" />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {getStoreName(parseInt(storeId))}
                      </Typography>
                    </Box>
                  }
                  action={
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => {
                        setSelectedStore(storeId);
                        handleOpenDialog();
                      }}
                    >
                      Ajouter
                    </Button>
                  }
                />
                <CardContent>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Jour</TableCell>
                          <TableCell>Créneau</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Horaires</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {groupedHours[storeId]
                          .sort((a, b) => daysOfWeek.findIndex(d => d.value === a.day_of_week) - 
                                       daysOfWeek.findIndex(d => d.value === b.day_of_week))
                          .map((hours) => (
                          <TableRow key={hours.id}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {getDayLabel(hours.day_of_week)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={getTimeSlotDisplay(hours)} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              {getStatusChip(hours)}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {getTimeDisplay(hours)}
                              </Typography>
                              {hours.notes && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {hours.notes}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(hours)}
                                color="primary"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(hours.id)}
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

      {/* Dialog de création/édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
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
                  value={formData.store_id}
                  onChange={handleInputChange}
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
                  value={formData.day_of_week}
                  onChange={handleInputChange}
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
            <Grid size={{ xs: 12,sm:6}}>
              <FormControl fullWidth required>
                <InputLabel>Créneau horaire</InputLabel>
                <Select
                  name="time_slot_name"
                  value={formData.time_slot_name}
                  onChange={handleInputChange}
                  label="Créneau horaire"
                >
                  {timeSlots.map(slot => (
                    <MenuItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12}}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 'bold' }}>
                Configuration rapide des créneaux
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleQuickTimeSlot('matin')}
                  sx={{ 
                    borderColor: '#4caf50', 
                    color: '#4caf50',
                    '&:hover': { bgcolor: '#4caf50', color: 'white' }
                  }}
                >
                  🌅 Matin (9h-12h)
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleQuickTimeSlot('apres-midi')}
                  sx={{ 
                    borderColor: '#ff9800', 
                    color: '#ff9800',
                    '&:hover': { bgcolor: '#ff9800', color: 'white' }
                  }}
                >
                  🌞 Après-midi (14h-18h)
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleQuickTimeSlot('soiree')}
                  sx={{ 
                    borderColor: '#9c27b0', 
                    color: '#9c27b0',
                    '&:hover': { bgcolor: '#9c27b0', color: 'white' }
                  }}
                >
                  🌙 Soirée (18h-21h)
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleQuickTimeSlot('pause-dejeuner')}
                  sx={{ 
                    borderColor: '#f44336', 
                    color: '#f44336',
                    '&:hover': { bgcolor: '#f44336', color: 'white' }
                  }}
                >
                  🍽️ Pause déjeuner (12h-14h)
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_open}
                    onChange={handleInputChange}
                    name="is_open"
                  />
                }
                label="Magasin ouvert ce jour"
              />
            </Grid>

            {formData.is_open && (
              <>
                <Grid size={{ xs: 12}}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_24h}
                        onChange={handleInputChange}
                        name="is_24h"
                      />
                    }
                    label="Ouvert 24h/24"
                  />
                </Grid>

                {!formData.is_24h && (
                  <>
                    <Grid size={{ xs: 12,sm:6}}>
                      <TextField
                        fullWidth
                        label="Heure d'ouverture"
                        name="open_time"
                        type="time"
                        value={formData.open_time}
                        onChange={handleInputChange}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12,sm:6}}>
                      <TextField
                        fullWidth
                        label="Heure de fermeture"
                        name="close_time"
                        type="time"
                        value={formData.close_time}
                        onChange={handleInputChange}
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
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Ex: Pause déjeuner de 12h à 14h, fermeture exceptionnelle..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            {editingHours ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de report au planning */}
      <Dialog open={openReportDialog} onClose={handleCloseReportDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule />
            Reporter les horaires au planning
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12,sm:6}}>
              <FormControl fullWidth required>
                <InputLabel>Magasin</InputLabel>
                <Select
                  name="store_id"
                  value={reportOptions.store_id}
                  onChange={handleReportOptionsChange}
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
              <TextField
                fullWidth
                label="Catégorie des tâches"
                name="task_category"
                value={reportOptions.task_category}
                onChange={handleReportOptionsChange}
              />
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                label="Date de début"
                name="start_date"
                type="date"
                value={reportOptions.start_date}
                onChange={handleReportOptionsChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                label="Date de fin"
                name="end_date"
                type="date"
                value={reportOptions.end_date}
                onChange={handleReportOptionsChange}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12}}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reportOptions.include_notes}
                    onChange={handleReportOptionsChange}
                    name="include_notes"
                  />
                }
                label="Inclure les notes et horaires dans les tâches"
              />
            </Grid>
            <Grid size={{ xs: 12}}>
              <Alert severity="info">
                <Typography variant="body2">
                  Cette action va créer des tâches dans le planning pour chaque créneau d'ouverture 
                  du magasin sélectionné sur la période choisie.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReportDialog}>Annuler</Button>
          <Button 
            onClick={handleConfirmReport} 
            variant="contained" 
            startIcon={<Schedule />}
            disabled={!reportOptions.store_id || !reportOptions.start_date || !reportOptions.end_date}
          >
            Créer les tâches
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreHoursTab;
