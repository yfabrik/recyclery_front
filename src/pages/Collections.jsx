import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Add,
  LocalShipping,
  LocationOn,
  Person,
  Schedule,
  Sync,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Collections = () => {
  const [syncing, setSyncing] = useState(false);

  // Fonction de synchronisation avec le planning principal
  const handleSyncWithPlanning = async () => {
    setSyncing(true);
    try {
      // Simuler une synchronisation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('🔄 Collectes synchronisées avec le planning principal !');
    } catch (error) {
      toast.error('Erreur lors de la synchronisation');
    } finally {
      setSyncing(false);
    }
  };

  const collections = [
    {
      id: 1,
      collection_date: '2023-12-20',
      address: '15 Rue des Lilas, 75003 Paris',
      contact_name: 'Marie Dubois',
      contact_phone: '06 11 22 33 44',
      description: 'Mobilier de bureau à récupérer',
      status: 'scheduled',
      assigned_to_name: 'Jean Martin'
    },
    {
      id: 2,
      collection_date: '2023-12-18',
      address: '42 Avenue de la République, 75011 Paris',
      contact_name: 'Paul Leroy',
      contact_phone: '06 55 66 77 88',
      description: 'Électroménager défaillant',
      status: 'completed',
      assigned_to_name: 'Sophie Bernard'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'info';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled': return 'Programmée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des Collectes
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Organisez et suivez les collectes de matériel
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => toast.info('Fonctionnalité en développement')}
          >
            Nouvelle Collecte
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {collections.map((collection) => (
          <Grid size={{ xs: 12, md: 6}} key={collection.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <LocalShipping />
                    </Avatar>
                    <Typography variant="h6">
                      Collecte #{collection.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(collection.status)}
                    color={getStatusColor(collection.status)}
                    size="small"
                  />
                </Box>

                <List dense>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Schedule color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={new Date(collection.collection_date).toLocaleDateString('fr-FR')}
                      secondary="Date prévue"
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <LocationOn color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={collection.address}
                      secondary="Adresse de collecte"
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Person color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={collection.contact_name}
                      secondary={`Contact: ${collection.contact_phone}`}
                    />
                  </ListItem>

                  {collection.assigned_to_name && (
                    <ListItem disablePadding>
                      <ListItemAvatar>
                        <Person color="primary" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={collection.assigned_to_name}
                        secondary="Assigné à"
                      />
                    </ListItem>
                  )}
                </List>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description:
                  </Typography>
                  <Typography variant="body2">
                    {collection.description}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {collection.status === 'scheduled' && (
                    <>
                      <Button size="small" variant="contained" color="warning">
                        Démarrer
                      </Button>
                      <Button size="small" variant="outlined">
                        Modifier
                      </Button>
                    </>
                  )}
                  {collection.status === 'in_progress' && (
                    <Button size="small" variant="contained" color="success">
                      Terminer
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Collections;

