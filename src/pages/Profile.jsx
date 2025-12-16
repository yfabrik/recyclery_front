import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person,
  Email,
  Business,
  CalendarToday,
  Edit,
  Save,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();

  const handleSave = () => {
    toast.success('Profil mis à jour');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'warning';
      case 'employee': return 'info';
      default: return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'manager': return 'Gestionnaire';
      case 'employee': return 'Employé';
      default: return 'Inconnu';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mon Profil
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Gérez vos informations personnelles
      </Typography>

      <Grid container spacing={3}>
        {/* Informations de base */}
        <Grid size={{ xs: 12,md:4}}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              
              <Typography variant="h5" gutterBottom>
                {user?.username}
              </Typography>
              
              <Chip
                label={getRoleLabel(user?.role)}
                color={getRoleColor(user?.role)}
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="outlined"
                startIcon={<Edit />}
                size="small"
                onClick={() => toast.info('Fonctionnalité en développement')}
              >
                Modifier la photo
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Détails du profil */}
        <Grid size={{ xs: 12,md:8}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations personnelles
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12,sm:6}}>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    value={user?.username || ''}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                
                <Grid size={{ xs: 12,sm:6}}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={user?.email || ''}
                    variant="outlined"
                    size="small"
                    type="email"
                  />
                </Grid>
                
                <Grid size={{ xs: 12,sm:6}}>
                  <TextField
                    fullWidth
                    label="Rôle"
                    value={getRoleLabel(user?.role)}
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
                
                <Grid size={{ xs: 12,sm:6}}>
                  <TextField
                    fullWidth
                    label="Recyclerie"
                    value="Centre-Ville"
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                >
                  Sauvegarder
                </Button>
                <Button variant="outlined">
                  Annuler
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques utilisateur */}
        <Grid size={{ xs: 12}}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informations du compte
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Nom d'utilisateur"
                    secondary={user?.username}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Email />
                  </ListItemIcon>
                  <ListItemText
                    primary="Adresse email"
                    secondary={user?.email}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary="Recyclerie assignée"
                    secondary="Centre-Ville"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Membre depuis"
                    secondary="Janvier 2023"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;

