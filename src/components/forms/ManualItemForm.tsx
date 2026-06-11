import { zodResolver } from "@hookform/resolvers/zod";
import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  FormCategorySubcategoryFields,
  FormInput,
  type BaseFormProps,
} from "./FormBase";

import { Euro, Scale } from "@mui/icons-material";
import { useEffect } from "react";
import * as z from "zod";
import type { CategoryModel } from "../../interfaces/Models";
import { idSchema } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";
import { usePrompt } from "../Prompt";
import { sumPromoCategorie } from "../../services/cartService";

const schema = z.object({
  category_id: idSchema("categorie requis"),
  subcategory_id: z.union([idSchema(), z.literal("").transform(() => null)]),
  weight: z.coerce.number().positive(),
  price: z.coerce.number("prix requis").positive("prix requis"),
  description: z.string(),
  promotion: z.coerce.number().min(0).max(100),
});

export type Schema = z.infer<typeof schema>;
export const ManualItemForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
}: BaseFormProps<Schema> & {
  categories: CategoryModel[];
}) => {
  const { prompt, PromptDialog } = usePrompt();
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: "",
      subcategory_id: "",
      weight: "",
      price: "",
      description: "",
      promotion: "",
      ...data,
    },
  });



  const categoryId = form.watch("category_id");
  const subcategoryId = form.watch("subcategory_id");

  useEffect(() => {
    const priceState = form.getFieldState("price")
    const weightState = form.getFieldState("weight")
    const promoState = form.getFieldState("promotion")

    const promoValue = (form.getValues("promotion") || 0) as number

    const category = categories.find((c) => c.id == categoryId);
    const subcategory = category?.subcategories?.find(
      (c) => c.id == subcategoryId,
    );
    const source = subcategory ?? category;
    if (!source) return;

    if (!priceState.isDirty) {
      form.setValue("price", source.defaultPrice ?? 0);
    }
    if (!weightState.isDirty) {
      form.setValue("weight", source.defaultWeight ?? 0);
    }
    const promo = sumPromoCategorie(category) + sumPromoCategorie(subcategory)
    if (!promoState.isDirty || promo > (promoValue)) {
      form.setValue("promotion", promo);
    }

  }, [categoryId, subcategoryId, categories]);

  return (
    <>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <FormCategorySubcategoryFields
            control={form.control}
            categories={categories}
            setValue={form.setValue}
          />

          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              control={form.control}
              label="Poids (kg) - Optionnel"
              name="weight"
              extra={{
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
                    {
                      shouldDirty: true,
                      shouldTouch: true
                    }
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
                onClick: async () =>
                  form.setValue(
                    "price",
                    await prompt(
                      "",
                      form.getValues("price")?.toString() || "",
                      {
                        unit: "€",
                      },
                    ),
                    {
                      shouldDirty: true,
                      shouldTouch: true
                    }
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
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              label="Promotion (%)"
              control={form.control}
              name="promotion"
              extra={{}}
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
      {PromptDialog}
    </>
  );
};
