import {
  Block,
  CheckCircle,
  Edit,
  PersonAdd,
  VpnKey,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { type StoreModel, type UserModel } from "../../interfaces/Models";
import { fetchStores as fStores } from "../../services/api/store";
import {
  createUser,
  fetchUsers as fUsers,
  getRoles,
  getUsersStats,
  updateUser,
  updateUserPassword,
} from "../../services/api/users";
import { UserForm } from "../forms/UserForm";
import { StatCardNoIcon } from "../StatCard";

export const UsersTab = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState<StoreModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialog, setUserDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    usersByRole: [],
    activeEmployees: 0,
    recentLogins: 0,
  });
  // const [userForm, setUserForm] = useState<userModel>({
  //   username: "",
  //   email: "",
  //   password: "",
  //   first_name: "",
  //   last_name: "",
  //   phone: "",
  //   role: "",
  //   recyclery_id: "",
  //   is_active: true,
  // });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchStores();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await getRoles();

      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fStores({ active: 1 });

      setStores(response.data.stores);
    } catch (error) {
      console.error("Erreur lors du chargement des magasins:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await getUsersStats();
      setUserStats(response.data.stats || {});
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleOpenUserDialog = (user: UserModel | null = null) => {
    setEditingUser(user);

    // if (user) {
    //   setEditingUser(user);
    //   setUserForm({
    //     username: user.username,
    //     email: user.email,
    //     password: "",
    //     first_name: user.first_name || "",
    //     last_name: user.last_name || "",
    //     phone: user.phone || "",
    //     role: user.role || "",
    //     recyclery_id: user.recyclery_id || "",
    //     is_active: user.is_active !== 0,
    //   });
    // } else {
    //   setEditingUser(null);
    //   setUserForm({
    //     username: "",
    //     email: "",
    //     password: "",
    //     first_name: "",
    //     last_name: "",
    //     phone: "",
    //     role: "",
    //     recyclery_id: "",
    //     is_active: true,
    //   });
    // }
    setUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialog(false);
    setEditingUser(null);
    // setUserForm({
    //   username: "",
    //   email: "",
    //   password: "",
    //   first_name: "",
    //   last_name: "",
    //   phone: "",
    //   role: "",
    //   recyclery_id: "",
    //   is_active: true,
    // });
  };

  const handleSaveUser = async (data) => {
    try {
      if (editingUser?.id) {
        // Mise à jour
        const updateData = { ...data };
        delete updateData.password; // Ne pas envoyer le mot de passe lors de la mise à jour

        await updateUser(editingUser.id, updateData);

        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Création
        if (!data.password) {
          toast.error("Le mot de passe est requis pour un nouvel utilisateur");
          return;
        }

        await createUser(data);

        toast.success("Utilisateur créé avec succès");
      }

      handleCloseUserDialog();
      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors de la sauvegarde"
      );
    }
  };

  const handleOpenPasswordDialog = (user) => {
    setEditingUser(user);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
    setEditingUser(null);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    try {
      await updateUserPassword(editingUser.id, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      toast.success("Mot de passe mis à jour avec succès");
      handleClosePasswordDialog();
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error(
        error.response?.data?.error ||
          "Erreur lors du changement de mot de passe"
      );
    }
  };

  const handleToggleUserStatus = async (user: UserModel) => {
    try {
      const newStatus = !user.isActive;

      if (newStatus) {
        await updateUser(user.id, { isActive: newStatus });
        // Réactiver l'utilisateur
        toast.success("Utilisateur réactivé");
      } else {
        // Désactiver l'utilisateur
        await updateUser(user.id, { isActive: false });

        toast.success("Utilisateur désactivé");
      }

      fetchUsers();
      fetchUserStats();
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error(
        error.response?.data?.error || "Erreur lors du changement de statut"
      );
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "error",
      direction: "warning",
      coordination: "info",
      encadrant: "primary",
      salarie: "default",
    };
    return colors[role] || "default";
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return "Jamais connecté";
    return new Date(lastLogin).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          👥 Gestion des Utilisateurs
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => handleOpenUserDialog()}
        >
          Nouvel Utilisateur
        </Button>
      </Box>

      {/* Statistiques des utilisateurs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCardNoIcon
            title="Utilisateurs actifs"
            value={userStats.totalUsers}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCardNoIcon
            title=" Connectés (30j)"
            value={userStats.activeEmployees}
            color="success.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCardNoIcon
            title=" Rôles différents"
            value={userStats.usersByRole?.length}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Répartition par rôles */}
      {userStats.usersByRole && userStats.usersByRole.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Répartition par Rôles
            </Typography>
            <Grid container spacing={2}>
              {userStats.usersByRole.map((rolestat) => (
                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={rolestat.role}>
                  <Box sx={{ textAlign: "center" }}>
                    <Chip
                      label={rolestat.role}
                      color={getRoleBadgeColor(rolestat.role)}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6">{rolestat.count}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Liste des utilisateurs */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Liste des Utilisateurs ({users.length})
          </Typography>

          {users.length === 0 ? (
            <Alert severity="info">Aucun utilisateur trouvé.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Rôle</TableCell>
                    <TableCell>Magasin</TableCell>
                    <TableCell>Dernière connexion</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {user.first_name && user.last_name
                              ? `${user.first_name} ${user.last_name}`
                              : user.username}
                          </Typography>
                          {user.first_name && user.last_name && (
                            <Typography variant="caption" color="textSecondary">
                              @{user.username}
                            </Typography>
                          )}
                          {user.phone && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="textSecondary"
                            >
                              📞 {user.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role_name || user.role}
                          color={getRoleBadgeColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {/* //FIXME c'est bancal et pas forcement utile vu que peut y avoir plusieur store */}
                        {user.recyclery_name || "Non assigné"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatLastLogin(user.last_login)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? "Actif" : "Inactif"}
                          color={user.isActive ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Modifier">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenUserDialog(user)}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Changer le mot de passe">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleOpenPasswordDialog(user)}
                            >
                              <VpnKey />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={user.isActive ? "Désactiver" : "Réactiver"}
                          >
                            <IconButton
                              size="small"
                              color={user.isActive ? "error" : "success"}
                              onClick={() => handleToggleUserStatus(user)}
                            >
                              {user.isActive ? <Block /> : <CheckCircle />}
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/modification d'utilisateur */}
      <Dialog
        open={userDialog}
        onClose={handleCloseUserDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingUser ? "✏️ Modifier l'utilisateur" : "👤 Nouvel utilisateur"}
        </DialogTitle>
        <DialogContent>
          <UserForm
            formId="UserForm"
            roles={roles}
            stores={stores}
            defaultValues={editingUser}
            onSubmit={handleSaveUser}
          />
          {/* <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nom d'utilisateur *"
                value={userForm.username}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, username: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Prénom"
                value={userForm.first_name}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nom"
                value={userForm.last_name}
                onChange={(e) =>
                  setUserForm((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Téléphone"
                value={userForm.phone}
                onChange={(e) =>
                  setUserForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </Grid>
            {!editingUser && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Mot de passe *"
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Rôle *</InputLabel>
                <Select
                  value={userForm.role}
                  label="Rôle *"
                  onChange={(e) =>
                    setUserForm((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  {roles.map((role) => (
                    <MenuItem key={role.name} value={role.name}>
                      {role.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Magasin</InputLabel>
                <Select
                  value={userForm.recyclery_id}
                  label="Magasin"
                  onChange={(e) =>
                    setUserForm((prev) => ({
                      ...prev,
                      recyclery_id: e.target.value,
                    }))
                  }
                >
                  <MenuItem key="no-store" value="">
                    Aucun magasin assigné
                  </MenuItem>
                  {stores.map((store) => (
                    <MenuItem key={store.id} value={store.id}>
                      {store.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={userForm.is_active}
                    onChange={(e) =>
                      setUserForm((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                  />
                }
                label="Utilisateur actif"
              />
            </Grid>
          </Grid> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Annuler</Button>
          <Button
            type="submit"
            form="UserForm"
            variant="contained"
            // disabled={
            //   !userForm.username ||
            //   !userForm.email ||
            //   !userForm.role ||
            //   (!editingUser && !userForm.password)
            // }
          >
            {editingUser ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de changement de mot de passe */}
      <Dialog
        open={passwordDialog}
        onClose={handleClosePasswordDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>🔐 Changer le mot de passe</DialogTitle>
        <DialogContent>
          {editingUser && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Changement de mot de passe pour :{" "}
              <strong>{editingUser.username}</strong>
            </Alert>
          )}
          <TextField
            fullWidth
            margin="normal"
            label="Mot de passe actuel"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Nouveau mot de passe"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
          />
          <TextField
            fullWidth
            margin="normal"
            label="Confirmer le nouveau mot de passe"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Annuler</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            color="warning"
            disabled={
              !passwordForm.currentPassword ||
              !passwordForm.newPassword ||
              !passwordForm.confirmPassword
            }
          >
            Changer le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
