import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem
} from "@mui/material";
import { useForm } from "react-hook-form";
import { FormInput, FormSelect, FormSwitch } from "./FormBase";

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
    handleSubmit,
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
              <FormInput name="username"
                control={control} label="Nom d'utilisateur *" />

            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="email"
                control={control}
                label="Email*"
                extra={{ type: "email" }} />

            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="prenom"
                control={control}
                label="Prénom" />

            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="nom"
                control={control}
                label="Nom" />

            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput name="phone"
                control={control}
                label="Téléphone" />

            </Grid>
            {!editingUser && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput name="password"
                  control={control}
                  label="Mot de passe *" />

              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect name="role"
                label="Rôle *"
                control={control}>
                {roles.map((role) => (
                  <MenuItem key={role.name} value={role.name}>
                    {role.display_name}
                  </MenuItem>
                ))}
              </FormSelect>

            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect name="store"
                label="Magasin"
                control={control}>
                <MenuItem key="no-store" value="">
                  Aucun magasin assigné
                </MenuItem>
                {stores.map((store) => (
                  <MenuItem key={store.id} value={store.id}>
                    {store.name}
                  </MenuItem>
                ))}
              </FormSelect>

            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormSwitch name="active"
                control={control} label="Utilisateur actif" />

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
    </Dialog >
  );
};
