import {
  Add,
  Business,
  Email,
  Person
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import {
  getUserRoleColor,
  getUserRoleIcon,
  getUserRoleLabel,
} from '../constants/userRoles';
/**
 * 
 * @returns @deprecated mais j'aime bien les card
 */
const Users = () => {
  const users = [
    {
      id: 1,
      username: 'marie.dupont',
      email: 'marie.dupont@recyclerie.fr',
      role: 'admin',
      recyclery_name: 'Centre-Ville',
      created_at: '2023-01-15'
    },
    {
      id: 2,
      username: 'jean.martin',
      email: 'jean.martin@recyclerie.fr',
      role: 'manager',
      recyclery_name: 'Quartier Nord',
      created_at: '2023-03-20'
    },
    {
      id: 3,
      username: 'sophie.bernard',
      email: 'sophie.bernard@recyclerie.fr',
      role: 'employee',
      recyclery_name: 'Centre-Ville',
      created_at: '2023-06-10'
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des Utilisateurs
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez les comptes utilisateurs et leurs permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => toast.info('Fonctionnalité en développement')}
        >
          Nouvel Utilisateur
        </Button>
      </Box>

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid size={{ xs: 12, md: 6,lg:4}} key={user.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${getUserRoleColor(user.role)}.main` }}>
                      {getUserRoleIcon(user.role) ?? <Person />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">
                        {user.username}
                      </Typography>
                      <Chip
                        label={getUserRoleLabel(user.role)}
                        color={getUserRoleColor(user.role)}
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>

                <List dense>
                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Email color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.email}
                      secondary="Email"
                    />
                  </ListItem>

                  {user.recyclery_name && (
                    <ListItem disablePadding>
                      <ListItemAvatar>
                        <Business color="action" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.recyclery_name}
                        secondary="Recyclerie"
                      />
                    </ListItem>
                  )}

                  <ListItem disablePadding>
                    <ListItemAvatar>
                      <Person color="action" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={new Date(user.created_at).toLocaleDateString('fr-FR')}
                      secondary="Créé le"
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" fullWidth>
                    Modifier
                  </Button>
                  <Button size="small" variant="outlined" color="error" fullWidth>
                    Supprimer
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

export default Users;

