import { zodResolver } from "@hookform/resolvers/zod";
import { Euro, Print, Scale } from "@mui/icons-material";
import { Box, Grid, MenuItem, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { CategoryModel } from "../../interfaces/Models";
import { emptyStringToNull } from "../../services/zodTransform";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";
import { idSchema } from "../../interfaces/ZodTypes";
import { usePrompt } from "../Prompt";

interface LabeledFormProps extends BaseFormProps<Schema> {
  categories: CategoryModel[];
}
const schema = z.object({
  category_id: idSchema("category requis"),
  subcategory_id: z.union([idSchema(), z.literal("").transform((v) => null)]),
  weight: z.coerce.number().positive(),
  price: z.coerce.number().positive("prix requis"),
  condition_state: z.enum(["excellent", "good", "fair", "poor"]),
  location: z.string().transform((v) => (v == "" ? null : v)),
  description: z.string().transform((v) => (v == "" ? null : v)),
  autoPrint: z.boolean().default(true),
});

type Schema = z.infer<typeof schema>;

export const LabeledItemForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
}: LabeledFormProps) => {
  const { prompt, PromptDialog } = usePrompt();
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};

  const conditionOptions = [
    { value: "excellent", label: "Excellent", color: "success" },
    { value: "good", label: "Bon état", color: "primary" },
    { value: "fair", label: "État correct", color: "warning" },
    { value: "poor", label: "Mauvais état", color: "error" },
  ];
  const form = useForm({
    defaultValues: {
      category_id: "",
      subcategory_id: "",
      weight: 0,
      price: 0,
      condition_state: "excellent",
      location: "",
      description: "",
      autoPrint: true,
      ...data,
    },
    resolver: zodResolver(schema),
  });

  const categoryId = form.watch("category_id");
  const subcategories = () => {
    return categoryId
      ? categories.find((c) => c.id == categoryId)?.subcategories || []
      : [];
  };

  return (
    <>
      {PromptDialog}
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              control={form.control}
              label="Catégories"
              name="category_id"
            >
              <MenuItem value="">Aucune</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              control={form.control}
              label="Sous-catégories"
              name="subcategory_id"
            >
              <MenuItem value="">Aucune</MenuItem>
              {subcategories().map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              control={form.control}
              name="weight"
              label="Poids (kg)"
              extra={{
                type: "number",
                onClick: async () =>
                  form.setValue(
                    "weight",
                    await prompt(
                      "",
                      form.getValues("weight")?.toString() || "",
                      {
                        unit: "Kg",
                      },
                    ),
                  ),
                sx: {
                  "& .MuiInputBase-input": {
                    cursor: "pointer",
                    backgroundColor: "#f8f9fa",
                  },
                },
                placeholder: "Cliquez pour saisir",
                slotProps: {
                  input: {
                    startAdornment: (
                      <Scale sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    // readOnly: true,
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              control={form.control}
              name="price"
              label="Prix de vente (€)"
              extra={{
                type: "number",
                onClick: async () =>
                  form.setValue(
                    "price",
                    await prompt(
                      "",
                      form.getValues("price")?.toString() || "",
                      { unit: "€" },
                    ),
                  ),
                sx: {
                  "& .MuiInputBase-input": {
                    cursor: "pointer",
                    backgroundColor: "#f8f9fa",
                  },
                },
                placeholder: "Cliquez pour saisir",
                slotProps: {
                  input: {
                    startAdornment: (
                      <Euro sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    // readOnly: true,
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              control={form.control}
              name="condition_state"
              label="État"
            >
              {conditionOptions.map((condition) => (
                <MenuItem key={condition.value} value={condition.value}>
                  {condition.label}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              control={form.control}
              name="location"
              label="Emplacement"
              extra={{
                placeholder: "Ex: Rayon A, Étagère 2",
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormInput
              control={form.control}
              name="description"
              label="Description"
              extra={{
                multiline: true,
                rows: 3,
                placeholder: "Description détaillée de l'article...",
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                backgroundColor: "#f8f9fa",
                borderRadius: 1,
                border: "1px solid #e0e0e0",
              }}
            >
              <Print sx={{ color: "primary.main" }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="medium">
                  Impression automatique
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Imprimer l'étiquette automatiquement après la sauvegarde
                </Typography>
              </Box>
              <FormSwitch control={form.control} name="autoPrint" label="" />
            </Box>
          </Grid>
        </Grid>
      </form>
    </>
  );
};
