import { Box, Grid, MenuItem, Switch, Typography } from "@mui/material";
import { Scale, Euro, Print } from "@mui/icons-material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";

import {
  FormInput,
  FormSelect,
  type BaseFormProps,
} from "./FormBase";

const conditionEnum = z.enum([
  "excellent",
  "good",
  "fair",
  "poor",
]);

const schema = z.object({
  category_id: z.string().nonempty("La catégorie est requise"),
  subcategory_id: z.string().optional(),
  weight: z.string().optional(),
  price: z.string().nonempty("Le prix de vente est requis"),
  condition_state: conditionEnum.default("good"),
  location: z.string().optional(),
  description: z.string().optional(),
  autoPrint: z.boolean().default(false),
});

export type LabelFormSchema = z.infer<typeof schema>;

type CategoryOption = {
  id: number | string;
  name: string;
  parent_id?: number | string | null;
  subcategories?: { id: number | string; name: string }[];
};

type ConditionOption = {
  value: z.infer<typeof conditionEnum>;
  label: string;
  color: string;
};

type LabelFormProps = BaseFormProps<LabelFormSchema> & {
  categories: CategoryOption[];
  conditionOptions: ConditionOption[];
  onWeightFieldClick: () => void;
  onPriceFieldClick: () => void;
};

export const LabelForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
  conditionOptions,
  onWeightFieldClick,
  onPriceFieldClick,
}: LabelFormProps) => {
  const form = useForm<LabelFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: defaultValues?.category_id || "",
      subcategory_id: defaultValues?.subcategory_id || "",
      weight: defaultValues?.weight || "",
      price: defaultValues?.price || "",
      condition_state: defaultValues?.condition_state || "good",
      location: defaultValues?.location || "",
      description: defaultValues?.description || "",
      autoPrint: defaultValues?.autoPrint || false,
    },
  });

  const categoryId = form.watch("category_id");

  // Reset subcategory when category changes
  useEffect(() => {
    form.setValue("subcategory_id", "");
  }, [categoryId, form]);

  const getSubcategories = () => {
    const selectedCategory = categories.find((cat) => cat.id == categoryId);
    return selectedCategory?.subcategories || [];
  };

  const mainCategories = categories.filter((cat) => !cat.parent_id);

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            control={form.control}
            name="category_id"
            label="Catégories"
          >
            {mainCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            control={form.control}
            name="subcategory_id"
            label="Sous-catégories"
            extra={{ disabled: !categoryId }}
          >
            <MenuItem value="">Aucune</MenuItem>
            {getSubcategories().map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
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
              onClick: onWeightFieldClick,
              placeholder: "Cliquez pour saisir",
              sx: {
                "& .MuiInputBase-input": {
                  cursor: "pointer",
                  backgroundColor: "#f8f9fa",
                },
              },
              slotProps: {
                input: {
                  startAdornment: (
                    <Scale sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  readOnly: true,
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
              required: true,
              onClick: onPriceFieldClick,
              placeholder: "Cliquez pour saisir",
              sx: {
                "& .MuiInputBase-input": {
                  cursor: "pointer",
                  backgroundColor: "#f8f9fa",
                },
              },
              slotProps: {
                input: {
                  startAdornment: (
                    <Euro sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  readOnly: true,
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
          <Controller
            name="autoPrint"
            control={form.control}
            render={({ field }) => (
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
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="primary"
                />
              </Box>
            )}
          />
        </Grid>
      </Grid>
    </form>
  );
};
