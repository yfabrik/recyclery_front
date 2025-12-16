import React from 'react';
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
} from '@mui/material';
import {
  Add,
  VolunteerActivism,
  Person,
  Phone,
  Schedule,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Donations = () => {
  const donations = [
    {
      id: 1,
      donor_name: 'Pierre Durand',
      donor_phone: '06 12 34 56 78',
      item_description: 'Mobilier de salon complet',
      estimated_value: 200,
      status: 'pending',
      created_at: '2023-12-15T10:30:00'
    },
    {
      id: 2,
      donor_name: 'Sophie Martin',
      donor_phone: '06 98 76 54 32',
      item_description: 'Électroménager divers',
      estimated_value: 150,
      status: 'received',
      created_at: '2023-12-14T14:15:00'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'received': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'received': return 'Reçu';
      case 'rejected': return 'Refusé';
      default: return 'Inconnu';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des Apports
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez les dons et apports de matériel
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => toast.info('Fonctionnalité en développement')}
        >
          Nouvel Apport
        </Button>
      </Box>

      <Grid container spacing={3}>
        {donations.map((donation) => (
          <Grid item xs={12} md={6} key={donation.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <VolunteerActivism />
                    </Avatar>
                    <Typography variant="h6">
                      Don #{donation.id}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusLabel(donation.status)}
                    color={getStatusColor(donation.status)}
                    size="small"
                  />
                </Box>

                <List dense>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Person color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={donation.donor_name}
                      secondary="Donateur"
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Phone color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={donation.donor_phone}
                      secondary="Téléphone"
                    />
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Schedule color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={new Date(donation.created_at).toLocaleDateString('fr-FR')}
                      secondary="Date du don"
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description des articles:
                  </Typography>
                  <Typography variant="body2">
                    {donation.item_description}
                  </Typography>
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    Valeur estimée: {donation.estimated_value}€
                  </Typography>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="contained" color="success">
                    Accepter
                  </Button>
                  <Button size="small" variant="outlined" color="error">
                    Refuser
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Donations;

