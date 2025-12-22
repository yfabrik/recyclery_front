import {
  Block,
  CheckCircle,
  Edit,
  PersonAdd,
  VpnKey
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDialog, setUserDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userStats, setUserStats] = useState({
    total_users: 0,
    users_by_role: [],
    active_last_30_days: 0,
  });
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "",
    recyclery_id: "",
    is_active: true,
  });
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
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/users/roles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores(response.data.stores?.filter((store) => store.is_active) || []);
    } catch (error) {
      console.error("Erreur lors du chargement des magasins:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/users/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserStats(response.data.stats || {});
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username,
        email: user.email,
        password: "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        role: user.role || "",
        recyclery_id: user.recyclery_id || "",
        is_active: user.is_active !== 0,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
        role: "",
        recyclery_id: "",
        is_active: true,
      });
    }
    setUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialog(false);
    setEditingUser(null);
    setUserForm({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "",
      recyclery_id: "",
      is_active: true,
    });
  };

  const handleSaveUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (editingUser) {
        // Mise à jour
        const updateData = { ...userForm };
        delete updateData.password; // Ne pas envoyer le mot de passe lors de la mise à jour

        await axios.put(`/api/users/${editingUser.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        // Création
        if (!userForm.password) {
          toast.error("Le mot de passe est requis pour un nouvel utilisateur");
          return;
        }

        await axios.post("/api/users", userForm, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/users/${editingUser.id}/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  const handleToggleUserStatus = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !user.is_active;

      if (newStatus) {
        // Réactiver l'utilisateur
        await axios.put(
          `/api/users/${user.id}`,
          { is_active: true },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Utilisateur réactivé");
      } else {
        // Désactiver l'utilisateur
        await axios.delete(`/api/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {userStats.total_users}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Utilisateurs actifs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {userStats.active_last_30_days}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Connectés (30j)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {userStats.users_by_role?.length || 0}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Rôles différents
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Répartition par rôles */}
      {userStats.users_by_role && userStats.users_by_role.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Répartition par Rôles
            </Typography>
            <Grid container spacing={2}>
              {userStats.users_by_role.map((rolestat) => (
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
                        {user.recyclery_name || "Non assigné"}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatLastLogin(user.last_login)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? "Actif" : "Inactif"}
                          color={user.is_active ? "success" : "default"}
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
                            title={user.is_active ? "Désactiver" : "Réactiver"}
                          >
                            <IconButton
                              size="small"
                              color={user.is_active ? "error" : "success"}
                              onClick={() => handleToggleUserStatus(user)}
                            >
                              {user.is_active ? <Block /> : <CheckCircle />}
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Annuler</Button>
          <Button
            onClick={handleSaveUser}
            variant="contained"
            disabled={
              !userForm.username ||
              !userForm.email ||
              !userForm.role ||
              (!editingUser && !userForm.password)
            }
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
