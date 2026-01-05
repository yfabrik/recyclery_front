import {
  AccessTime,
  Add,
  CalendarToday,
  Delete,
  Edit,
  LocationOn,
  Person,
  Phone,
  Refresh,
  Schedule,
  Search,
  Store,
  Work
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { createUser, deleteUser, fetchUsers, updateUser } from '../../../services/api/users';
import EmployeeStoreAssignment from '../../EmployeeStoreAssignment';
import EmployeeWorkdays from '../../EmployeeWorkdays';

const EmployeeManagement = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Nouveaux états pour les dialogs d'affectation et jours de travail
  const [openStoreAssignmentDialog, setOpenStoreAssignmentDialog] = useState(false);
  const [openWorkdaysDialog, setOpenWorkdaysDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'employee',
    recyclery_id: null,
    phone: '',
    contract_hours: 35
  });

  const skillsOptions = [
    'Collecte',
    'Tri',
    'Vente',
    'Maintenance',
    'Conduite',
    'Gestion',
    'Informatique',
    'Communication',
    'Formation'
  ];

  const availabilityOptions = [
    { value: 'full_time', label: 'Temps plein' },
    { value: 'part_time', label: 'Temps partiel' },
    { value: 'weekend', label: 'Week-end' },
    { value: 'evening', label: 'Soirée' },
    { value: 'flexible', label: 'Flexible' }
  ];

  const roleOptions = [
    { value: 'employee', label: 'Employé' },
    { value: 'manager', label: 'Manager' },
    { value: 'supervisor', label: 'Superviseur' },
    { value: 'driver', label: 'Chauffeur' },
    { value: 'collector', label: 'Collecteur' }
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetchUsers({role:"employee"})
      setEmployees(response.data.users);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        username: employee.username || '',
        email: employee.email || '',
        role: employee.role || 'employee',
        recyclery_id: employee.recyclery_id || null,
        phone: employee.phone || '',
        contract_hours: employee.contract_hours || 35
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        username: '',
        email: '',
        role: 'employee',
        recyclery_id: null,
        phone: '',
        contract_hours: 35
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEmployee(null);
    setFormData({
      username: '',
      email: '',
      role: 'employee',
      recyclery_id: null,
      phone: '',
      contract_hours: 35
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenStoreAssignment = (employee) => {
    setSelectedEmployee(employee);
    setOpenStoreAssignmentDialog(true);
  };

  const handleOpenWorkdays = (employee) => {
    setSelectedEmployee(employee);
    setOpenWorkdaysDialog(true);
  };

  const handleCloseStoreAssignment = () => {
    setOpenStoreAssignmentDialog(false);
    setSelectedEmployee(null);
  };

  const handleCloseWorkdays = () => {
    setOpenWorkdaysDialog(false);
    setSelectedEmployee(null);
  };


  const handleSave = async () => {
    try {
      // const token = localStorage.getItem('token');
      
      if (editingEmployee) {
        // Mise à jour
        await updateUser(editingEmployee.id,formData)
        // await axios.put(`/api/users/${editingEmployee.id}`, formData, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Employé mis à jour avec succès');
      } else {
        // Création
        await createUser({...formData,password:"password123"})
        // await axios.post('/api/users', {
        //   ...formData,
        //   //TODO FIXME FIXME FIXME TODO
        //   password: 'password123' // Mot de passe par défaut ///////ARRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRHHHHH
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        toast.success('Employé créé avec succès');
      }
      
      handleCloseDialog();
      fetchEmployees();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      return;
    }

    try {

      await deleteUser(employeeId)
      toast.success('Employé supprimé avec succès');
      fetchEmployees();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'employee': 'default',
      'manager': 'primary',
      'supervisor': 'secondary',
      'driver': 'warning',
      'collector': 'info'
    };
    return colors[role] || 'default';
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      'full_time': 'success',
      'part_time': 'warning',
      'weekend': 'info',
      'evening': 'secondary',
      'flexible': 'default'
    };
    return colors[availability] || 'default';
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || employee.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && employee.is_active !== false) ||
                         (filterStatus === 'inactive' && employee.is_active === false);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography>Chargement des employés...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* En-tête */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Gestion des Employés
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez vos employés et leurs compétences
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          size="large"
        >
          Nouvel Employé
        </Button>
      </Box>
      {/* Filtres et recherche */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12,md:4}}>
            <TextField
              fullWidth
              placeholder="Rechercher un employé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12,md:3}}>
            <FormControl fullWidth>
              <InputLabel>Rôle</InputLabel>
              <Select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                label="Rôle"
              >
                <MenuItem value="all">Tous les rôles</MenuItem>
                {roleOptions.map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12,md:3}}>
            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Statut"
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="inactive">Inactif</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12,md:2}}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchEmployees}
              fullWidth
            >
              Actualiser
            </Button>
          </Grid>
        </Grid>
      </Paper>
      {/* Liste des employés */}
      <Grid container spacing={3}>
        {filteredEmployees.map((employee) => (
          <Grid size={{ xs: 12,sm:6,md:4,lg:3}} key={employee.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                    <Person />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {employee.username}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {employee.email}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(employee)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(employee.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Work fontSize="small" color="action" />
                    <Chip 
                      label={roleOptions.find(r => r.value === employee.role)?.label || employee.role}
                      color={getRoleColor(employee.role)}
                      size="small"
                    />
                  </Box>

                  {employee.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2">{employee.phone}</Typography>
                    </Box>
                  )}

                  {employee.contract_hours && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime fontSize="small" color="action" />
                      <Typography variant="body2">
                        {employee.contract_hours}h/semaine
                      </Typography>
                    </Box>
                  )}

                  {employee.address && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" noWrap>
                        {employee.address}
                      </Typography>
                    </Box>
                  )}

                  {employee.availability && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      <Chip 
                        label={availabilityOptions.find(a => a.value === employee.availability)?.label || employee.availability}
                        color={getAvailabilityColor(employee.availability)}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  )}

                  {employee.skills && employee.skills.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="textSecondary" gutterBottom>
                        Compétences:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {employee.skills.slice(0, 3).map((skill, index) => (
                          <Chip key={index} label={skill} size="small" variant="outlined" />
                        ))}
                        {employee.skills.length > 3 && (
                          <Chip label={`+${employee.skills.length - 3}`} size="small" variant="outlined" />
                        )}
                      </Box>
                    </Box>
                  )}

                  {employee.hourly_rate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="bold">
                        {employee.hourly_rate}€/h
                      </Typography>
                    </Box>
                  )}
                </Stack>

                {/* Boutons d'action supplémentaires */}
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                  <Tooltip title="Gérer les affectations aux magasins">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Store />}
                      onClick={() => handleOpenStoreAssignment(employee)}
                      sx={{ flex: 1 }}
                    >
                      Magasins
                    </Button>
                  </Tooltip>
                  <Tooltip title="Configurer les jours de travail">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Schedule />}
                      onClick={() => handleOpenWorkdays(employee)}
                      sx={{ flex: 1 }}
                    >
                      Horaires
                    </Button>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {filteredEmployees.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            Aucun employé trouvé
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter un employé'
            }
          </Typography>
        </Box>
      )}
      {/* Dialog de création/édition */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                required
                label="Nom d'utilisateur"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <FormControl fullWidth required>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Rôle"
                >
                  {roleOptions.map(role => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                label="Téléphone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="06 12 34 56 78"
              />
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                label="Heures de contrat par semaine"
                name="contract_hours"
                type="number"
                value={formData.contract_hours}
                onChange={handleInputChange}
                helperText="Nombre d'heures par semaine (défaut: 35h)"
                slotProps={{
                  htmlInput: { min: 1, max: 60 }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12,sm:6}}>
              <TextField
                fullWidth
                label="ID Recyclerie"
                name="recyclery_id"
                type="number"
                value={formData.recyclery_id || ''}
                onChange={handleInputChange}
                helperText="ID de la recyclerie (optionnel)"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            {editingEmployee ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog d'affectation aux magasins */}
      <Dialog 
        open={openStoreAssignmentDialog} 
        onClose={handleCloseStoreAssignment} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Affectation aux magasins
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <EmployeeStoreAssignment
              employeeId={selectedEmployee.id}
              employeeName={selectedEmployee.username}
              onClose={handleCloseStoreAssignment}
              onSave={() => {
                // Optionnel: actualiser la liste des employés
                fetchEmployees();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog de gestion des jours de travail */}
      <Dialog 
        open={openWorkdaysDialog} 
        onClose={handleCloseWorkdays} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Jours de travail
        </DialogTitle>
        <DialogContent>
          {selectedEmployee && (
            <EmployeeWorkdays
              employeeId={selectedEmployee.id}
              employeeName={selectedEmployee.username}
              onClose={handleCloseWorkdays}
              onSave={() => {
                // Optionnel: actualiser la liste des employés
                fetchEmployees();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default EmployeeManagement;
