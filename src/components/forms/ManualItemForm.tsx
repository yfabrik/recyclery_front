import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useForm, useWatch, type Control } from "react-hook-form";
import {
    FormInput,
    FormSelect,
    type BaseFormProps
} from "./FormBase";

import { Euro, Scale } from "@mui/icons-material";
import * as z from "zod";
import type { CategoryModel } from "../../interfaces/Models";

const schema = z.object({
  category_id: z.coerce.number(),
  subcategory_id: z.coerce.number(),
  weight: z.coerce.number(),
  price: z.coerce.number(),
  description:z.string()
});

type Schema = z.infer<typeof schema>;
export const ManualItemForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
  OpenKeypad,
}: BaseFormProps<Schema> & {
  categories: CategoryModel[];
  OpenKeypad: (a: boolean) => void;
}) => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...(defaultValues ?? {}),
    },
  });

  const SubCategories = ({ control }: { control: Control<Schema> }) => {
    const category = useWatch({
      control:control,
      name: "category_id",
    });
    const subcats =
      categories.find((c) => c.id == category)?.subcategories ?? [];
    return (
      <FormSelect
        control={form.control}
        name="subcategory_id"
        label="Sous-catégorie"
        extra={{ disabled: subcats.length < 1 }}
      >
        <MenuItem value="">Aucune</MenuItem>
        {subcats.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </FormSelect>
    );
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            control={form.control}
            name="category_id"
            label="Catégorie"
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        {/* Sous-catégorie si disponible */}

        <Grid size={{ xs: 12, md: 6 }}>
          <SubCategories control={form.control} />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            label="Poids (kg) - Optionnel"
            name="weight"
            extra={{
              onClick: () => OpenKeypad(true),
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
                  readOnly: true,
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            label="Prix de vente (€)"
            control={form.control}
            name="price"
            extra={{
              onClick: () => OpenKeypad(true),
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
                  readOnly: true,
                },
              },
            }}
          />
        </Grid>

        {/* Aperçu du nom généré */}
        {/* {(manualItemData.category_id || manualItemData.subcategory_id) && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "grey.300",
              }}
            >
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Aperçu de l'article :
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {(() => {
                  const selectedCategory = categories.find(
                    (cat) => cat.id == manualItemData.category_id
                  );
                  const selectedSubcategory = categories.find(
                    (cat) => cat.id == manualItemData.subcategory_id
                  );

                  if (selectedSubcategory) {
                    return `${selectedSubcategory.name} (${selectedCategory?.name})`;
                  } else if (selectedCategory) {
                    return selectedCategory.name;
                  }
                  return "Sélectionnez une catégorie";
                })()}
              </Typography>
            </Box>
          </Grid>
        )} */}

        <Grid size={{ xs: 12 }}>
          <FormInput
            label="Description (optionnelle)"
            control={form.control}
            name="description"
            extra={{
              multiline: true,
              rows: 2,
              placeholder: "Description de l'article...",
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};
