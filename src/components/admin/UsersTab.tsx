import {
  Assignment,
  BarChart,
  Delete,
  Edit,
  Groups,
  Lock,
  Person,
  PersonAdd,
  Phone,
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
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getUserRoleColor,
  getUserRoleIcon,
  getUserRoleLabel,
} from "../../constants/userRoles";
import { type UserModel } from "../../interfaces/Models";
import { fetchStores as fStores } from "../../services/api/store";
import {
  createUser,
  deleteUser,
  fetchUsers as fUsers,
  getUsersStats,
  updateUser,
  updateUserPassword,
} from "../../services/api/users";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../utils/apiToastMessage";
import {
  PasswordChangeForm,
  type Schema as PasswordSchema,
} from "../forms/PasswordChangeForm";
import { UserForm, type Schema } from "../forms/UserForm";
import { StatCardNoIcon } from "../StatCard";

export const UsersTab = () => {
  const [userDialog, setUserDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserModel | null>(null);

  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ["users", { include: "managedStores" }],
    queryFn: () =>
      fUsers({ include: "managedStores" }).then(
        (response) => response.data.users,
      ),
  });
  if (users.isError)
    toast.error(
      getApiErrorMessage(
        users.error,
        "Erreur lors du chargement des utilisateurs",
      ),
    );

  const userStats = useQuery({
    queryKey: ["userStats"],
    queryFn: () => getUsersStats().then((response) => response.data.stats),
    placeholderData: {
      totalUsers: 0,
      usersByRole: [],
      activeEmployees: 0,
      recentLogins: 0,
    },
  });

  const editUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Schema }) =>
      updateUser(id, data),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      save();
      toast.success(
        getApiSuccessMessage(data, "Utilisateur mis à jour avec succès"),
      );
    },
  });
  const addUser = useMutation({
    mutationFn: (data: Schema) => createUser(data),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      save();
      toast.success(getApiSuccessMessage(data, "Utilisateur créé avec succès"));
    },
  });
  const save = () => {
    handleCloseUserDialog();
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["userStats"] });
  };

  const removeUser = useMutation({
    mutationFn: (data: number) => deleteUser(data),
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["userStats"] });
      toast.success(
        getApiSuccessMessage(data, "Utilisateur supprimé avec succès"),
      );
    },
  });

  const changePassword = useMutation({
    mutationFn: (data: { id: number; data: PasswordSchema }) =>
      updateUserPassword(data.id, data.data),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Mot de passe mis à jour avec succès"),
      );
      handleClosePasswordDialog();
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Erreur lors du changement de mot de passe"),
      ),
  });
  const stores = useQuery({
    queryKey: ["stores", "active"],
    queryFn: () =>
      fStores({ active: true }).then((response) => response.data.stores),
  });

  const handleOpenUserDialog = (user: UserModel | null = null) => {
    setEditingUser(user);
    setUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialog(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (data: Schema) => {
    if (editingUser?.id) editUser.mutate({ id: editingUser.id, data });
    else addUser.mutate(data);
  };

  const handleOpenPasswordDialog = (user: UserModel) => {
    setEditingUser(user);
    setPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialog(false);
    setEditingUser(null);
  };

  const handleChangePassword = async (data: PasswordSchema) => {
    if (!editingUser?.id) return;
    changePassword.mutate({ id: editingUser?.id, data });
  };

  const handleDeleteUser = async (user: UserModel) => {
    removeUser.mutate(user.id);
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
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Groups />
          Gestion des Utilisateurs
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
            value={userStats.data?.totalUsers || 0}
            color="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCardNoIcon
            title=" Connectés (30j)"
            value={userStats.data?.activeEmployees || 0}
            color="success.main"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StatCardNoIcon
            title=" Rôles différents"
            value={userStats.data?.usersByRole?.length || 0}
            color="info.main"
          />
        </Grid>
      </Grid>

      {/* Répartition par rôles */}
      {userStats.data?.usersByRole &&
        userStats.data?.usersByRole.length > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <BarChart fontSize="small" />
                Répartition par Rôles
              </Typography>
              <Grid container spacing={2}>
                {userStats.data.usersByRole.map((rolestat) => (
                  <Grid size={{ xs: 6, sm: 4, md: 2 }} key={rolestat.role}>
                    <Box sx={{ textAlign: "center" }}>
                      <Chip
                        icon={getUserRoleIcon(rolestat.role)}
                        label={getUserRoleLabel(rolestat.role)}
                        color={getUserRoleColor(rolestat.role)}
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
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Assignment fontSize="small" />
            Liste des Utilisateurs ({users.data?.length || 0})
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
                            {user.username}
                          </Typography>

                          {user.phone && (
                            <Typography
                              variant="caption"
                              display="block"
                              color="textSecondary"
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Phone sx={{ fontSize: 14 }} />
                              {user.phone}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={getUserRoleLabel(user.role)}
                          color={getUserRoleColor(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {user.managedStores?.map((s) => s.name).toString() ||
                          "Non assigné"}
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
                          <Tooltip title="supprimer utilisateur">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Delete />
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {editingUser ? (
            <>
              <Edit fontSize="small" />
              Modifier l'utilisateur
            </>
          ) : (
            <>
              <Person fontSize="small" />
              Nouvel utilisateur
            </>
          )}
        </DialogTitle>
        <DialogContent>
          <UserForm
            formId="UserForm"
            stores={stores.data || []}
            defaultValues={{
              ...editingUser,
              managedStores: editingUser?.managedStores?.map((s) => s.id),
            }}
            onSubmit={handleSaveUser}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Annuler</Button>
          <Button
            type="submit"
            form="UserForm"
            variant="contained"
            loading={editUser.isPending || addUser.isPending}
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
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Lock fontSize="small" />
          Changer le mot de passe
        </DialogTitle>
        <DialogContent>
          {editingUser && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Changement de mot de passe pour :{" "}
              <strong>{editingUser.username}</strong>
            </Alert>
          )}

          <PasswordChangeForm
            formId="passwordChange"
            onSubmit={handleChangePassword}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Annuler</Button>
          <Button
            variant="contained"
            color="warning"
            type="submit"
            form="passwordChange"
            loading={changePassword.isPending}
          >
            Changer le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
