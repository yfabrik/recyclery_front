import {
  AccessTime,
  AccountCircle,
  Business,
  CalendarToday,
  Email,
  Lock,
  Person,
  Phone,
  Save,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  PasswordChangeForm,
  type Schema as PasswordSchema,
} from '../components/forms/PasswordChangeForm';
import {
  ProfileForm,
  type Schema as ProfileSchema,
} from '../components/forms/ProfileForm';
import {
  getUserRoleColor,
  getUserRoleLabel,
} from '../constants/userRoles';
import { useAuth } from '../contexts/AuthContext';
import { updateProfilePassword } from '../services/api/profile';
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from '../utils/apiToastMessage';

const PROFILE_FORM_ID = 'profile-form';
const PASSWORD_FORM_ID = 'profile-password-form';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formKey, setFormKey] = useState(0);
  const [passwordFormKey, setPasswordFormKey] = useState(0);

  const formatDate = (date?: string | null) =>
    date ? new Date(date).toLocaleDateString('fr-FR') : '—';

  const managedStores =
    user?.managedStores?.map((store) => store.name).join(', ') || '—';

  const saveProfile = useMutation({
    mutationFn: (data: ProfileSchema) => updateProfile(data),
    onSuccess: (result) => {
      if (result.success) setFormKey((key) => key + 1);
    },
  });

  const changePassword = useMutation({
    mutationFn: (data: PasswordSchema) =>
      updateProfilePassword({ ...data, currentPassword: data.currentPassword ?? "" }),
    onSuccess: (response) => {
      toast.success(
        getApiSuccessMessage(response, 'Mot de passe mis à jour avec succès'),
      );
      setPasswordFormKey((key) => key + 1);
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, 'Erreur lors du changement de mot de passe'),
      ),
  });

  const handleSaveProfile = (data: ProfileSchema) => {
    saveProfile.mutate(data);
  };

  const handleChangePassword = (data: PasswordSchema) => {
    changePassword.mutate(data);
  };

  const handleCancelProfile = () => {
    setFormKey((key) => key + 1);
  };

  const handleCancelPassword = () => {
    setPasswordFormKey((key) => key + 1);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
      >
        <AccountCircle fontSize="large" />
        Mon Profil
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Gérez vos informations personnelles
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem',
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>

              <Typography variant="h5" gutterBottom>
                {user?.username}
              </Typography>

              <Chip
                label={getUserRoleLabel(user?.role ?? '')}
                color={getUserRoleColor(user?.role ?? '')}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Person fontSize="small" />
                Informations personnelles
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <ProfileForm
                key={`${formKey}-${user?.id ?? 'guest'}`}
                formId={PROFILE_FORM_ID}
                defaultValues={{
                  username: user?.username,
                  email: user?.email,
                  phone: user?.phone,
                }}
                onSubmit={handleSaveProfile}
              />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Rôle"
                    value={getUserRoleLabel(user?.role ?? '')}
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Recyclerie"
                    value={managedStores}
                    variant="outlined"
                    size="small"
                    disabled
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  form={PROFILE_FORM_ID}
                  variant="contained"
                  startIcon={<Save />}
                  loading={saveProfile.isPending}
                >
                  Sauvegarder
                </Button>
                <Button variant="outlined" onClick={handleCancelProfile}>
                  Annuler
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Lock fontSize="small" />
                Changer le mot de passe
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <PasswordChangeForm
                key={passwordFormKey}
                formId={PASSWORD_FORM_ID}
                requireCurrentPassword
                onSubmit={handleChangePassword}
              />

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  form={PASSWORD_FORM_ID}
                  variant="contained"
                  color="warning"
                  loading={changePassword.isPending}
                >
                  Changer le mot de passe
                </Button>
                <Button variant="outlined" onClick={handleCancelPassword}>
                  Annuler
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
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
                    <Phone />
                  </ListItemIcon>
                  <ListItemText
                    primary="Téléphone"
                    secondary={user?.phone || '—'}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <Business />
                  </ListItemIcon>
                  <ListItemText
                    primary="Recyclerie assignée"
                    secondary={managedStores}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Membre depuis"
                    secondary={formatDate(user?.createdAt)}
                  />
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <AccessTime />
                  </ListItemIcon>
                  <ListItemText
                    primary="Dernière connexion"
                    secondary={formatDate(user?.last_login)}
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