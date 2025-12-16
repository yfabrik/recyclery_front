import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
} from '@mui/material';
import {
  Receipt,
  Visibility,
  Download,
  Print,
  Search,
  FilterList,
  CalendarToday,
  LocationOn,
  Person,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import CollectionReceipt from '../components/CollectionReceipt';

const CollectionReceipts = () => {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState([]);
  const [filteredReceipts, setFilteredReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date_from: '',
    date_to: '',
    employee_id: ''
  });
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    fetchReceipts();
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [receipts, filters]);

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('token');
      // Pour l'instant, on récupère tous les plannings avec bordereaux
      const response = await axios.get('/api/collection-schedules', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const schedulesWithReceipts = (response.data.schedules || []).filter(schedule => 
        schedule.status === 'completed' || schedule.receipt_number
      );
      
      setReceipts(schedulesWithReceipts);
    } catch (error) {
      toast.error('Erreur lors du chargement des bordereaux');
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredEmployees = (response.data.users || []).filter(emp => 
        emp.role === 'employee' || emp.role === 'manager'
      );
      setEmployees(filteredEmployees);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...receipts];

    // Filtre par recherche
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(receipt => 
        receipt.collection_point_name?.toLowerCase().includes(searchLower) ||
        receipt.employee_name?.toLowerCase().includes(searchLower) ||
        receipt.receipt_number?.toLowerCase().includes(searchLower)
      );
    }

    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(receipt => receipt.status === filters.status);
    }

    // Filtre par employé
    if (filters.employee_id) {
      filtered = filtered.filter(receipt => receipt.employee_id == filters.employee_id);
    }

    // Filtre par date
    if (filters.date_from) {
      filtered = filtered.filter(receipt => receipt.scheduled_date >= filters.date_from);
    }
    if (filters.date_to) {
      filtered = filtered.filter(receipt => receipt.scheduled_date <= filters.date_to);
    }

    setFilteredReceipts(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewReceipt = (schedule) => {
    setSelectedReceipt(schedule);
    setReceiptDialog(true);
  };

  const handleCloseReceipt = () => {
    setReceiptDialog(false);
    setSelectedReceipt(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      'planned': 'primary',
      'in_progress': 'warning',
      'completed': 'success',
      'cancelled': 'error'
    };
    return colors[status] || 'default';
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography>Chargement des bordereaux...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <Receipt sx={{ mr: 1, verticalAlign: 'middle' }} />
          Bordereaux de Collecte
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Gestion et consultation des bordereaux de collecte
        </Typography>
      </Box>

      {/* Filtres */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList />
          Filtres
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Rechercher"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Point de collecte, employé, n° bordereau..."
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Statut"
              >
                <MenuItem value="">Tous</MenuItem>
                <MenuItem value="completed">Terminé</MenuItem>
                <MenuItem value="in_progress">En cours</MenuItem>
                <MenuItem value="planned">Planifié</MenuItem>
                <MenuItem value="cancelled">Annulé</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Employé</InputLabel>
              <Select
                value={filters.employee_id}
                onChange={(e) => handleFilterChange('employee_id', e.target.value)}
                label="Employé"
              >
                <MenuItem value="">Tous</MenuItem>
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Date début"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="Date fin"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({
                search: '',
                status: '',
                date_from: '',
                date_to: '',
                employee_id: ''
              })}
              sx={{ height: 56 }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {filteredReceipts.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Bordereaux trouvés
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {filteredReceipts.filter(r => r.status === 'completed').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Collectes terminées
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {filteredReceipts.filter(r => r.status === 'in_progress').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              En cours
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {filteredReceipts.filter(r => r.status === 'planned').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Planifiées
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Tableau des bordereaux */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Bordereau</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Point de Collecte</TableCell>
                <TableCell>Collecteur</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">
                      Aucun bordereau trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight="bold">
                          {receipt.receipt_number || `COL-${receipt.id}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday fontSize="small" />
                        <Box>
                          <Typography variant="body2">
                            {new Date(receipt.scheduled_date).toLocaleDateString('fr-FR')}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {receipt.scheduled_time}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn fontSize="small" color="primary" />
                        <Box>
                          <Typography variant="body2">
                            {receipt.collection_point_name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {receipt.collection_point_city}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person fontSize="small" />
                        <Typography variant="body2">
                          {receipt.employee_name || 'Non assigné'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(receipt.status)} 
                        color={getStatusColor(receipt.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleViewReceipt(receipt)}
                        color="primary"
                        size="small"
                        title="Voir le bordereau"
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog de bordereau */}
      <CollectionReceipt
        open={receiptDialog}
        onClose={handleCloseReceipt}
        schedule={selectedReceipt}
        onSaved={() => {
          fetchReceipts();
          handleCloseReceipt();
        }}
      />
    </Container>
  );
};

export default CollectionReceipts;
