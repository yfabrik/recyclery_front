import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

interface CategorieModel {
  id: number;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  parent_id: number | null;
}

interface CategorieFormProps {
  icons: Array<{ name: string; label: string }>;
  formId: string;
  onSubmit: SubmitHandler<
    Pick<CategorieModel, "name" | "description" | "icon" | "parent_id">
  >;
  category: CategorieModel;
}
export const CategorieForm = ({
  icons,
  formId,
  onSubmit,
  category,
}: CategorieFormProps) => {
  const form = useForm<
    Pick<CategorieModel, "name" | "description" | "icon" | "parent_id">
  >({
    defaultValues: category ?? {
      name: "",
      description: "",
      icon: "",
      parent_id: null,
    },
  });

  const getIconComponent = (name: string) => {
    return name;
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Controller
        name="name"
        control={form.control}
        render={({ field }) => (
          <TextField
            fullWidth
            label="Nom de la catégorie"
            {...field}
            margin="normal"
            required
          />
        )}
      />
      <Controller
        name="description"
        control={form.control}
        render={({ field }) => (
          <TextField
            fullWidth
            label="Nom de la catégorie"
            {...field}
            margin="normal"
            multiline
            rows={3}
          />
        )}
      />

      <Controller
        control={form.control}
        name="icon"
        render={({ field }) => (
          <FormControl fullWidth margin="normal">
            <InputLabel id="categorieIcon">Icône</InputLabel>
            <Select labelId="categorieIcon" label="Icône" {...field}>
              <MenuItem key="no-icon" value="">
                <em>Aucune icône</em>
              </MenuItem>
              {icons.map((icon) => (
                <MenuItem key={icon.name} value={icon.name}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getIconComponent(icon.name)}
                    {icon.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />
    </form>
  );
};
