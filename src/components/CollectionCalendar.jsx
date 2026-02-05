import React, { useState, useEffect, useCallback } from 'react';
// import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Paper,
  Toolbar,
  IconButton,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  Person,
  DirectionsCar,
  Schedule,
  Receipt,
  CalendarToday,
  Today,
  NavigateBefore,
  NavigateNext,
  Sync,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CollectionReceipt from './CollectionReceipt';
import DurationPicker from './DurationPicker';
import { createCollectionSchedule, deleteCollectionSchedule, getCollectionSchedules, updateCollectionSchedule } from '../services/api/collectionSchedules';
  import { fetchCollectionPoints as fCollectionPoints } from '../services/api/collectionPoint';
import { fetchUsers } from '../services/api/users';

// Configuration de moment en français
moment.locale('fr');
// const localizer = momentLocalizer(moment);

// Messages en français pour le calendrier
const messages = {
  allDay: 'Toute la journée',
  previous: 'Précédent',
  next: 'Suivant',
  today: 'Aujourd\'hui',
  month: 'Mois',
  week: 'Semaine',
  day: 'Jour',
  agenda: 'Agenda',
  date: 'Date',
  time: 'Heure',
  event: 'Collecte',
  noEventsInRange: 'Aucune collecte programmée pour cette période.',
  showMore: total => `+ ${total} collecte(s) supplémentaire(s)`
};

/**
 * @deprecated
 * @returns 
 */
const CollectionCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [selectedScheduleForReceipt, setSelectedScheduleForReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [syncing, setSyncing] = useState(false);
  const [formData, setFormData] = useState({
    collection_point_id: '',
    scheduled_date: '',
    scheduled_time: '09:00',
    employee_id: '',
    vehicle: '',
    estimated_duration: 60,
    notes: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchCollectionPoints();
    fetchEmployees();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      // const token = localStorage.getItem('token');
      const startOfMonth = moment(currentDate).startOf('month').format('YYYY-MM-DD');
      const endOfMonth = moment(currentDate).endOf('month').format('YYYY-MM-DD');
      
      const response = getCollectionSchedules({
          date_from: startOfMonth,
          date_to: endOfMonth
        })
      // await axios.get('/api/collection-schedules', {
      //   headers: { Authorization: `Bearer ${token}` },
      //   params: {
      //     date_from: startOfMonth,
      //     date_to: endOfMonth
      //   }
      // });
      
      const schedules = response.data.schedules || [];
      const calendarEvents = schedules.map(schedule => ({
        id: schedule.id,
        title: schedule.collection_point_name,
        start: new Date(`${schedule.scheduled_date}T${schedule.scheduled_time}`),
        end: moment(`${schedule.scheduled_date}T${schedule.scheduled_time}`)
          .add(schedule.estimated_duration || 60, 'minutes').toDate(),
        resource: {
          ...schedule,
          backgroundColor: getStatusColor(schedule.status),
          borderColor: getStatusColor(schedule.status, true),
        }
      }));
      
      setEvents(calendarEvents);
    } catch (error) {
      toast.error('Erreur lors du chargement des collectes');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionPoints = async () => {
    try {
      // const token = localStorage.getItem('token');
      const response = await fCollectionPoints({active_only:"true"})
      // await axios.get('/api/collection-points', {
      //   headers: { Authorization: `Bearer ${token}` },
      //   params: { active_only: 'true' }
      // });
      setCollectionPoints(response.data.collection_points || []);
    } catch (error) {
      console.error('Erreur lors du chargement des points de collecte:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      // const token = localStorage.getItem('token');
      const response = await fetchUsers()
      // await axios.get('/api/users', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      const filteredEmployees = (response.data.users || []).filter(emp => 
        emp.role === 'employee' || emp.role === 'manager'
      );
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const getStatusColor = (status, border = false) => {
    const colors = {
      'planned': border ? '#1976d2' : '#bbdefb',
      'in_progress': border ? '#f57c00' : '#ffe0b2',
      'completed': border ? '#388e3c' : '#c8e6c9',
      'cancelled': border ? '#d32f2f' : '#ffcdd2'
    };
    return colors[status] || (border ? '#757575' : '#f5f5f5');
  };

  const getStatusLabel = (status) => {
    const labels = {
      'planned': 'Planifié',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  };

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setFormData({
      collection_point_id: event.resource.collection_point_id || '',
      scheduled_date: moment(event.start).format('YYYY-MM-DD'),
      scheduled_time: moment(event.start).format('HH:mm'),
      employee_id: event.resource.employee_id || '',
      vehicle: event.resource.vehicle || '',
      estimated_duration: event.resource.estimated_duration || 60,
      notes: event.resource.notes || '',
    });
    setOpenDialog(true);
  }, []);

  const handleSelectSlot = useCallback((slotInfo) => {
    if (user?.role === 'employee') return; // Employés ne peuvent pas créer
    
    setSelectedEvent(null);
    setSelectedSlot(slotInfo);
    setFormData({
      collection_point_id: '',
      scheduled_date: moment(slotInfo.start).format('YYYY-MM-DD'),
      scheduled_time: moment(slotInfo.start).format('HH:mm'),
      employee_id: '',
      vehicle: '',
      estimated_duration: 60,
      notes: '',
    });
    setOpenDialog(true);
  }, [user]);

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const handleOpenReceipt = (event) => {
    setSelectedScheduleForReceipt(event.resource);
    setReceiptDialog(true);
  };

  const handleCloseReceipt = () => {
    setReceiptDialog(false);
    setSelectedScheduleForReceipt(null);
  };

  const handleReceiptSaved = () => {
    fetchEvents(); // Rafraîchir les événements
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDurationSelect = (duration) => {
    setFormData(prev => ({
      ...prev,
      estimated_duration: duration
    }));
    setShowDurationPicker(false);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (selectedEvent) {
        await updateCollectionSchedule(selectedEvent.id,formData)
        // await axios.put(`/api/collection-schedules/${selectedEvent.id}`, formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Collecte mise à jour avec succès');
      } else {
        await createCollectionSchedule(formData)

        // await axios.post('/api/collection-schedules', formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Collecte créée avec succès');
      }
      
      handleCloseDialog();
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette collecte ?')) {
      try {
        await deleteCollectionSchedule(selectedEvent.id)
        // const token = localStorage.getItem('token');
        // await axios.delete(`/api/collection-schedules/${selectedEvent.id}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Collecte supprimée avec succès');
        handleCloseDialog();
        fetchEvents();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
      }
    }
  };

  // Fonction de synchronisation avec le planning principal
  const handleSyncWithPlanning = async () => {
    setSyncing(true);
    try {
      // const token = localStorage.getItem('token');
      
      // Forcer le rechargement des données
      await Promise.all([
        fetchEvents(),
        fetchCollectionPoints(),
        fetchEmployees()
      ]);
      
      toast.success('🔄 Planning des collectes synchronisé avec le planning principal !');
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    return {
      style: {
        backgroundColor: event.resource.backgroundColor,
        borderColor: event.resource.borderColor,
        border: `2px solid ${event.resource.borderColor}`,
        borderRadius: '4px',
        color: '#333',
        fontSize: '12px',
        padding: '2px 4px',
      }
    };
  };

  const CustomEvent = ({ event }) => (
    <Box sx={{ p: 0.5, position: 'relative' }}>
      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
        {event.title}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
        <Person sx={{ fontSize: 12 }} />
        <Typography variant="caption">
          {event.resource.employee_name || 'Non assigné'}
        </Typography>
      </Box>
      {event.resource.vehicle && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <DirectionsCar sx={{ fontSize: 12 }} />
          <Typography variant="caption">
            {event.resource.vehicle}
          </Typography>
        </Box>
      )}
      <Box sx={{ 
        position: 'absolute', 
        top: 2, 
        right: 2, 
        display: 'flex', 
        gap: 0.5 
      }}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenReceipt(event);
          }}
          sx={{ 
            p: 0.25, 
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
          }}
        >
          <Receipt sx={{ fontSize: 12 }} />
        </IconButton>
      </Box>
    </Box>
  );

  const CustomToolbar = ({ label, onNavigate, onView, view: currentView }) => (
    <Toolbar sx={{ justifyContent: 'space-between', mb: 2, px: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => onNavigate('PREV')}>
          <NavigateBefore />
        </IconButton>
        <IconButton onClick={() => onNavigate('TODAY')}>
          <Today />
        </IconButton>
        <IconButton onClick={() => onNavigate('NEXT')}>
          <NavigateNext />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2 }}>
          {label}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {/* Bouton de synchronisation */}
        <Tooltip title="Synchroniser avec le planning principal">
          <span>
            <IconButton 
              onClick={handleSyncWithPlanning}
              disabled={syncing}
              sx={{ 
                color: syncing ? 'text.disabled' : 'primary.main',
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <Sync sx={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </span>
        </Tooltip>
        
        {['month', 'week', 'day', 'agenda'].map((viewName) => (
          <Button
            key={viewName}
            variant={currentView === viewName ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onView(viewName)}
          >
            {viewName === 'month' ? 'Mois' : 
             viewName === 'week' ? 'Semaine' : 
             viewName === 'day' ? 'Jour' : 'Agenda'}
          </Button>
        ))}
      </Box>
    </Toolbar>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Chargement du calendrier...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Paper sx={{ p: 3, height: 'calc(100vh - 200px)', minHeight: 600 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
            Calendrier des Collectes
          </Typography>
          
          {/* Légende des statuts */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {[
              { status: 'planned', label: 'Planifié' },
              { status: 'in_progress', label: 'En cours' },
              { status: 'completed', label: 'Terminé' },
              { status: 'cancelled', label: 'Annulé' }
            ].map(({ status, label }) => (
              <Chip
                key={status}
                label={label}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(status),
                  border: `1px solid ${getStatusColor(status, true)}`,
                }}
              />
            ))}
          </Box>
        </Box>

        {/* <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable={user?.role !== 'employee'}
          onNavigate={(date) => setCurrentDate(date)}
          onView={(view) => setView(view)}
          view={view}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent,
            toolbar: CustomToolbar,
          }}
          messages={messages}
          formats={{
            dayFormat: 'dddd DD/MM',
            dayHeaderFormat: 'dddd DD/MM',
            dayRangeHeaderFormat: ({ start, end }) =>
              `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`,
            monthHeaderFormat: 'MMMM YYYY',
            weekdayFormat: 'dddd',
          }}
          min={new Date(0, 0, 0, 7, 0, 0)} // 7h00
          max={new Date(0, 0, 0, 19, 0, 0)} // 19h00
          step={30}
          timeslots={2}
        /> */}
      </Paper>
      {/* Dialog de création/édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Modifier la Collecte' : 'Nouvelle Collecte'}
          {selectedEvent && (
            <Chip 
              label={getStatusLabel(selectedEvent.resource.status)} 
              color={selectedEvent.resource.status === 'completed' ? 'success' : 
                     selectedEvent.resource.status === 'cancelled' ? 'error' : 
                     selectedEvent.resource.status === 'in_progress' ? 'warning' : 'primary'}
              size="small"
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12}}>
              <FormControl fullWidth required>
                <InputLabel>Point de Collecte</InputLabel>
                <Select
                  name="collection_point_id"
                  value={formData.collection_point_id}
                  onChange={handleInputChange}
                  label="Point de Collecte"
                >
                  {collectionPoints.map((point) => (
                    <MenuItem key={point.id} value={point.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" />
                        {point.name} - {point.city}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleInputChange}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <TextField
                fullWidth
                type="time"
                label="Heure"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleInputChange}
                slotProps={{ inputLabel: { shrink: true } }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <FormControl fullWidth>
                <InputLabel>Collecteur</InputLabel>
                <Select
                  name="employee_id"
                  value={formData.employee_id}
                  onChange={handleInputChange}
                  label="Collecteur"
                >
                  <MenuItem value="">Non assigné</MenuItem>
                  {employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        {employee.username}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <TextField
                fullWidth
                label="Véhicule"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                placeholder="ex: Camionnette 01"
                slotProps={{
                  input: {
                    startAdornment: <DirectionsCar sx={{ mr: 1, color: 'text.secondary' }} />
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <TextField
                fullWidth
                type="number"
                label="Durée estimée (minutes)"
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleInputChange}
                slotProps={{
                  input: {
                    startAdornment: <Schedule sx={{ mr: 1, color: 'text.secondary' }} />,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowDurationPicker(true)}
                          startIcon={<Schedule />}
                        >
                          Sélecteur
                        </Button>
                      </InputAdornment>
                    )
                  },

                  htmlInput: { min: 15, max: 480 }
                }} />
            </Grid>
            <Grid size={{ xs: 12}}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Instructions spéciales, matériel nécessaire..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          {selectedEvent && (
            <Button 
              onClick={() => {
                handleCloseDialog();
                handleOpenReceipt(selectedEvent);
              }}
              startIcon={<Receipt />}
            >
              Bordereau
            </Button>
          )}
          {selectedEvent && user?.role !== 'employee' && (
            <Button 
              onClick={handleDelete} 
              color="error"
              startIcon={<Delete />}
            >
              Supprimer
            </Button>
          )}
          <Button onClick={handleCloseDialog}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={!formData.collection_point_id || !formData.scheduled_date || !formData.scheduled_time}
            startIcon={selectedEvent ? <Edit /> : <Add />}
          >
            {selectedEvent ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog de bordereau */}
      <CollectionReceipt
        open={receiptDialog}
        onClose={handleCloseReceipt}
        schedule={selectedScheduleForReceipt}
        onSaved={handleReceiptSaved}
      />
      {/* Sélecteur de durée */}
      <DurationPicker
        open={showDurationPicker}
        onClose={() => setShowDurationPicker(false)}
        onSelect={handleDurationSelect}
        initialValue={formData.estimated_duration || 60}
      />
    </Box>
  );
};

export default CollectionCalendar;
