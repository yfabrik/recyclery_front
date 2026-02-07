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
  Tooltip,
  Typography
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import { type UserModel } from "../../interfaces/Models";
import { fetchStores as fStores } from "../../services/api/store";
import {
  createUser,
  fetchUsers as fUsers,
  getRoles,
  getUsersStats,
  updateUser,
  updateUserPassword,
} from "../../services/api/users";
import { PasswordChangeForm, type Schema as PasswordSchema } from "../forms/PasswordChangeForm";
import { UserForm, type Schema } from "../forms/UserForm";
import { StatCardNoIcon } from "../StatCard";

export const UsersTab = () => {
  const [userDialog, setUserDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);

  const queryClient = useQueryClient()

  const users = useQuery({
    queryKey: ["users"],
    queryFn: () => fUsers().then(response => response.data.users)
  })
  if (users.isError) toast.error("Erreur lors du chargement des utilisateurs");

  const roles = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles().then(response => response.data.roles)
  })

  const userStats = useQuery({
    queryKey: ["userStats"],
    queryFn: () => getUsersStats().then(response => response.data.stats),
    placeholderData: {
      totalUsers: 0,
      usersByRole: [],
      activeEmployees: 0,
      recentLogins: 0,
    }
  })

  const editUser = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Schema }) => updateUser(id, data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      handleCloseUserDialog();
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["userStats"] })
      toast.success("Utilisateur mis à jour avec succès")
    }
  })
  const addUser = useMutation({
    mutationFn: (data: Schema) => createUser(data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      handleCloseUserDialog();
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["userStats"] })
      toast.success("Utilisateur créé avec succès");
    }
  })
  const stores = useQuery({
    queryKey: ["stores", "active"],
    queryFn: () => fStores({ active: true }).then(response => response.data.stores)
  })

  // const [passwordForm, setPasswordForm] = useState({
  //   currentPassword: "",
  //   newPassword: "",
  //   confirmPassword: "",
  // });


  const handleOpenUserDialog = (user: UserModel | null = null) => {
    setEditingUser(user);
    setUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialog(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (data: Schema) => {
    if (editingUser?.id) editUser.mutate({ id: editingUser.id, data })
    else addUser.mutate(data)
  };

  const handleOpenPasswordDialog = (user: UserModel) => {
    setEditingUser(user);
    // setPasswordForm({
    //   currentPassword: "",
    //   newPassword: "",
    //   confirmPassword: "",
    // });
    setPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
    setEditingUser(null);
    // setPasswordForm({
    //   currentPassword: "",
    //   newPassword: "",
    //   confirmPassword: "",
    // });
  };

  const handleChangePassword = async (data: PasswordSchema) => {
    // if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    //   toast.error("Les mots de passe ne correspondent pas");
    //   return;
    // }

    // if (passwordForm.newPassword.length < 6) {
    //   toast.error("Le mot de passe doit contenir au moins 6 caractères");
    //   return;
    // }

    try {
      await updateUserPassword(editingUser.id, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Mot de passe mis à jour avec succès");
      handleClosePasswordDialog();
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error(
        error.response?.data?.error ||
        "Erreur lors du changement de mot de passe",
      );
    }
  };

  const handleToggleUserStatus = async (user: UserModel) => {
    // try {
    const updatedUser: UserModel = { ...user, isActive: !user.isActive }
    editUser.mutate({ id: user.id, data: updatedUser })
    //   if (newStatus) {
    //     await updateUser(user.id, { isActive: newStatus });
    //     // Réactiver l'utilisateur
    //     toast.success("Utilisateur réactivé");
    //   } else {
    //     // Désactiver l'utilisateur
    //     await updateUser(user.id, { isActive: false });

    //     toast.success("Utilisateur désactivé");
    //   }

    //   // fetchUsers();
    //   // fetchUserStats();
    // } catch (error) {
    //   console.error("Erreur lors du changement de statut:", error);
    //   toast.error(
    //     error.response?.data?.error || "Erreur lors du changement de statut",
    //   );
    // }
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

  const formatLastLogin = (lastLogin: string) => {
    if (!lastLogin) return "Jamais connecté";
    return new Date(lastLogin).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (users.isLoading) {
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
            value={userStats.data.totalUsers}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCardNoIcon
            title=" Connectés (30j)"
            value={userStats.data.activeEmployees}
            color="success.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCardNoIcon
            title=" Rôles différents"
            value={userStats.data.usersByRole?.length}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Répartition par rôles */}
      {userStats.data.usersByRole && userStats.data.usersByRole.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Répartition par Rôles
            </Typography>
            <Grid container spacing={2}>
              {userStats.data.usersByRole.map((rolestat) => (
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
            📋 Liste des Utilisateurs ({users.data?.length || 0})
          </Typography>

          {users.data?.length === 0 ? (
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
                  {users.data?.map((user) => (
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
            roles={roles.data}
            stores={stores.data || []}
            defaultValues={editingUser}
            onSubmit={handleSaveUser}
          />
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

          <PasswordChangeForm formId="passwordChange" onSubmit={handleChangePassword} />

          {/* <TextField
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
          /> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Annuler</Button>
          <Button
            // onClick={handleChangePassword}
            variant="contained"
            color="warning"
            type="submit"
            form="passwordChange"
          // disabled={
          //   !passwordForm.currentPassword ||
          //   !passwordForm.newPassword ||
          //   !passwordForm.confirmPassword
          // }
          >
            Changer le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
