import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
  Backup,
  Update,
  Info,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Settings = () => {
  const handleSave = () => {
    toast.success('Paramètres sauvegardés');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Configurez les paramètres de votre système de recyclerie
      </Typography>

      <Grid container spacing={3}>
        {/* Notifications */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Notifications sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Notifications
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notifications email"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Notifications nouvelles ventes"
              />
              <FormControlLabel
                control={<Switch />}
                label="Notifications nouveaux dons"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Rappels collectes"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Sécurité */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Sécurité
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Authentification à deux facteurs"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Connexion automatique"
              />
              <FormControlLabel
                control={<Switch />}
                label="Audit des actions"
              />
              
              <Button variant="outlined" size="small" sx={{ mt: 2 }}>
                Changer le mot de passe
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Apparence */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Palette sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Apparence
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <FormControlLabel
                control={<Switch />}
                label="Mode sombre"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Thème coloré"
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Animations"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Système */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Système
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <Language />
                  </ListItemIcon>
                  <ListItemText
                    primary="Langue"
                    secondary="Français"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Backup />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sauvegarde automatique"
                    secondary="Activée - Dernière: Hier 23:00"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Update />
                  </ListItemIcon>
                  <ListItemText
                    primary="Mises à jour"
                    secondary="Version 1.0.0 - À jour"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Info />
                  </ListItemIcon>
                  <ListItemText
                    primary="Base de données"
                    secondary="SQLite - 2.3 MB utilisés"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small">
                  Sauvegarder
                </Button>
                <Button variant="outlined" size="small" color="warning">
                  Exporter données
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bouton de sauvegarde */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave}>
          Sauvegarder les paramètres
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;

