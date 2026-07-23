import { zodResolver } from "@hookform/resolvers/zod";
import { Euro, Scale } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { CategoryModel } from "../../interfaces/Models";
import { sumPromoCategorie } from "../../services/cartService";
import {
  manualItemSchema,
  type ManualItemFormOutput,
  type ManualItemFormValues,
} from "../../services/schema/item";
import { usePrompt } from "../Prompt";
import {
  FormCategorySubcategoryFields,
  FormInput,
  type BaseFormProps,
} from "./FormBase";

export type { ManualItemFormValues };
/** @deprecated Use ManualItemFormOutput */
export type ManualItemSchema = ManualItemFormOutput;

export const ManualItemForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
}: BaseFormProps<ManualItemFormValues, ManualItemFormOutput> & {
  categories: CategoryModel[];
}) => {
  const { prompt, PromptDialog } = usePrompt();
  // const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const form = useForm({
    resolver: zodResolver(manualItemSchema(categories)),
    defaultValues: {
      category_id: "",
      subcategory_id: "",
      weight: "",
      price: "",
      description: "",
      promotion: "",
      // ...data,
      ...defaultValues ??{}
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
  // const onDefaults = useCallback(
  //   ({
  //     category,
  //     subcategory,
  //   }: {
  //     category: CategoryModel | undefined;
  //     subcategory: CategoryModel | undefined;
  //   }) => {
  //     const promoState = form.getFieldState("promotion");
  //     const promoValue = (form.getValues("promotion") || 0) as number;
  //     const promo =
  //       sumPromoCategorie(category) + sumPromoCategorie(subcategory);
  //     if (!promoState.isDirty || promo > promoValue) {
  //       form.setValue("promotion", promo);
  //     }
  //   },
  //   [form],
  // );
  return (
    <>
      {PromptDialog}
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
    </>
  );
};
