import { zodResolver } from "@hookform/resolvers/zod";
import { Euro, Scale } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import type { CategoryModel } from "../../interfaces/Models";
import { sumPromoCategorie } from "../../services/cartService";
import { createPromptNumericValue } from "../../hooks/useSetNumericValue";
import {
  manualItemSchema,
  type ManualItemFormOutput,
  type ManualItemFormValues,
} from "../../services/schema/item";
import { usePrompt } from "../Prompt";
import {
  FormCategorySubcategoryFields,
  FormInput,
  FormNumber,
  type BaseFormProps,
} from "./FormBase";
import { useCategoryItemDefaults } from "../../hooks/useCategoryItemDefaults";

export type { ManualItemFormValues };

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
  const form = useForm<ManualItemFormValues, unknown, ManualItemFormOutput>({
    resolver: zodResolver(manualItemSchema(categories)),
    defaultValues: {
      category_id: "",
      subcategory_id: "",
      weight: "",
      price: "",
      description: "",
      promotion: "",
      ...defaultValues ??{}
    },
  });

  const categoryId = form.watch("category_id");
  const subcategoryId = form.watch("subcategory_id");

  const onDefaults = useCallback(
    ({
      category,
      subcategory,
    }: {
      category: CategoryModel | undefined;
      subcategory: CategoryModel | undefined;
    }) => {
      const promoState = form.getFieldState("promotion");
      const promoRaw = form.getValues("promotion");
      const promoValue = promoRaw === "" ? 0 : promoRaw;
      const promo =
        sumPromoCategorie(category) + sumPromoCategorie(subcategory);
      if (!promoState.isDirty || promo > promoValue) {
        form.setValue("promotion", promo);
      }
    },
    [form],
  );

  useCategoryItemDefaults({
    form,
    categories,
    categoryId,
    subcategoryId,
    skipWhenPrefilled: true,
    prefilledPrice: defaultValues?.price as number | undefined,
    prefilledWeight: defaultValues?.weight as number | undefined,
    onDefaults,
  });

  const setNumericField = createPromptNumericValue(form, prompt);

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
            <FormNumber
              hideSpinners={true}
              control={form.control}
              label="Poids (kg)"
              name="weight"
              extra={{
                onClick: () => setNumericField("weight", "Kg"),
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
            <FormNumber
              hideSpinners={true}
              label="Prix de vente (€)"
              control={form.control}
              name="price"
              extra={{
                onClick: () => setNumericField("price", "€"),
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
            <FormNumber
              label="Promotion (%)"
              control={form.control}
              name="promotion"
            />
          </Grid>

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
