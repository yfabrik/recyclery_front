import {
  Person,
  Save,
  Star,
  Store
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Typography
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchStores } from '../services/api/store';
import { addAssignedStore, getAssignedStores, removeAssignedStores } from '../services/api/users';

const EmployeeStoreAssignment = ({ employeeId, employeeName, onClose, onSave }) => {
  const [stores, setStores] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupérer tous les magasins
      const storesResponse = await fetchStores()
      setStores(storesResponse.data.stores || []); 
      // Récupérer les affectations actuelles de l'employé
      const assignmentsResponse = await getAssignedStores(employeeId)
      setAssignments(assignmentsResponse.data.assignments || []);    
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreToggle = (storeId) => {
    setAssignments(prev => {
      const existingAssignment = prev.find(a => a.store_id === storeId);
      
      if (existingAssignment) {
        // Supprimer l'affectation
        return prev.filter(a => a.store_id !== storeId);
      } else {
        // Ajouter une nouvelle affectation
        const store = stores.find(s => s.id === storeId);
        return [...prev, {
          store_id: storeId,
          store_name: store?.name || '',
          is_primary: prev.length === 0 // Premier magasin = principal par défaut
        }];
      }
    });
  };

  const handlePrimaryChange = (storeId) => {
    setAssignments(prev => 
      prev.map(assignment => ({
        ...assignment,
        is_primary: assignment.store_id === storeId
      }))
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // const token = localStorage.getItem('token');
      
      // Supprimer toutes les affectations existantes
      await removeAssignedStores(employeeId)
      // await axios.delete(`/api/employee-stores/employee/${employeeId}`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      // Créer les nouvelles affectations
      for (const assignment of assignments) {
        //TOOD c'est moche, l'url devrait avoir le employee id non ?
        await addAssignedStore({
          employee_id: employeeId,
          store_id: assignment.store_id,
          is_primary: assignment.is_primary
        })
        // await axios.post('/api/employee-stores', {
        //   employee_id: employeeId,
        //   store_id: assignment.store_id,
        //   is_primary: assignment.is_primary
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
      }
      
      toast.success('Affectations mises à jour avec succès');
      onSave && onSave();
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde des affectations');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement des magasins...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person />
          Affectation de {employeeName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez les magasins où cet employé peut travailler
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {stores.map(store => {
          const assignment = assignments.find(a => a.store_id === store.id);
          const isAssigned = !!assignment;
          const isPrimary = assignment?.is_primary || false;
          
          return (
            <Grid size={{ xs: 12,sm:6,md:4}} key={store.id}>
              <Card 
                sx={{ 
                  border: isAssigned ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  bgcolor: isAssigned ? '#f1f8e9' : 'white',
                  '&:hover': { 
                    boxShadow: 2,
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Store sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {store.name}
                    </Typography>
                    {isPrimary && (
                      <Chip
                        icon={<Star />}
                        label="Principal"
                        color="warning"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  {store.address && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      📍 {store.address}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isAssigned}
                          onChange={() => handleStoreToggle(store.id)}
                          color="primary"
                        />
                      }
                      label="Affecté"
                    />
                    
                    {isAssigned && (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isPrimary}
                            onChange={() => handlePrimaryChange(store.id)}
                            color="warning"
                          />
                        }
                        label="Principal"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {assignments.length > 0 && (
        <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom>
            Résumé des affectations :
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {assignments.map(assignment => (
              <Chip
                key={assignment.store_id}
                icon={assignment.is_primary ? <Star /> : <Store />}
                label={`${assignment.store_name}${assignment.is_primary ? ' (Principal)' : ''}`}
                color={assignment.is_primary ? 'warning' : 'primary'}
                variant="outlined"
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={saving}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save />}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </Box>
    </Box>
  );
};

export default EmployeeStoreAssignment;
