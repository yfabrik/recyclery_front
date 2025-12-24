import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";

interface EmployeeFormProps {
  userDialog: boolean;
  editingUser: boolean;
  handleCloseUserDialog: () => {};
  stores: Array<{ id: number; name: string }>;
  roles: Array<{ name: string; display_name: string }>;
}

interface FormData {
  username: string;
  email: string;
  prenom: string;
  nom: string;
  phone: string;
  password: string;
  role: string;
  store: string;
  active: boolean;
}
export const EmployeeForm = ({
  userDialog,
  editingUser,
  handleCloseUserDialog,
  roles,
  stores,
}: EmployeeFormProps) => {
  const {
    control,
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nom: "t",
      active: true,
    },
  });
  const onSubmit = handleSubmit((data) => console.log(data));
  return (
    <Dialog
      open={userDialog}
      onClose={handleCloseUserDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingUser ? "✏️ Modifier l'utilisateur" : "👤 Nouvel utilisateur"}
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Nom d'utilisateur *" {...field} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Email*" {...field} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="prenom"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Prénom" {...field} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="nom"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Nom" {...field} />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField fullWidth label="Téléphone" {...field} />
                )}
              />
            </Grid>
            {!editingUser && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField fullWidth label="Mot de passe *" {...field} />
                  )}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="role">Rôle *</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select labelId="role" label="Rôle *" {...field}>
                      {roles.map((role) => (
                        <MenuItem key={role.name} value={role.name}>
                          {role.display_name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel id="magasin">Magasin</InputLabel>
                <Controller
                  name="store"
                  control={control}
                  render={({ field }) => (
                    <Select label="Magasin" labelId="magasin" {...field}>
                      <MenuItem key="no-store" value="">
                        Aucun magasin assigné
                      </MenuItem>
                      {stores.map((store) => (
                        <MenuItem key={store.id} value={store.id}>
                          {store.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Utilisateur actif"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>Annuler</Button>
          <Button type="submit" variant="contained">
            {editingUser ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
