import { zodResolver } from "@hookform/resolvers/zod";
import { Euro, Scale } from "@mui/icons-material";
import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import {
  LABELED_ITEM_CONDITIONS,
} from "../../constants/labeledItemConditions";
import { useCategoryItemDefaults } from "../../hooks/useCategoryItemDefaults";
import { createPromptNumericValue } from "../../hooks/useSetNumericValue";
import type { CategoryModel } from "../../interfaces/Models";
import {
  labeledItemSchema,
  type LabeledItemFormOutput,
  type LabeledItemFormValues,
} from "../../services/schema/item";
import { usePrompt } from "../Prompt";
import {
  FormCategorySubcategoryFields,
  FormInput,
  FormSelect,
  type BaseFormProps,
} from "./FormBase";

export type { LabeledItemFormValues };

type FormValues = LabeledItemFormValues;

interface LabeledFormProps extends BaseFormProps<FormValues, LabeledItemFormOutput> {
  categories: CategoryModel[];
}

export const LabeledItemForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
}: LabeledFormProps) => {
  const { prompt, PromptDialog } = usePrompt();

  // RHF `useForm<Values, Ctx, Output>` + Zod `z.input` vs `z.infer` mismatch:
  // `z.coerce.number()` / `.transform()` (and `preprocess`) make input ≠ output, so
  // `setValue`/`getValues` for those fields resolve to `never`. `as Path` / `as PathValue`
  // are escape hatches, not real proofs — prefer aligning form state with what the UI
  // holds (e.g. price: number) or mapping type-changing transforms outside the form schema.
  // Switching coerce → preprocess does not fix this.
  const form = useForm<FormValues, unknown, LabeledItemFormOutput>({
    defaultValues: {
      category_id: "",
      subcategory_id: "",
      weight: 0,
      price: 0,
      condition_state: "excellent" as const,
      location: "",
      description: "",
      ...defaultValues ?? {},
    },
    resolver: zodResolver(labeledItemSchema(categories)),
  });
  const categoryId = form.watch("category_id");
  const subcategoryId = form.watch("subcategory_id");

  useCategoryItemDefaults({
    form,
    categories,
    categoryId,
    subcategoryId,
    skipWhenPrefilled: true,
    prefilledPrice: defaultValues?.price as number|undefined,
    prefilledWeight: defaultValues?.weight as number|undefined,
    onDefaults: (ctx) => {
      console.log(ctx);
    },
  })
  const setNumericField = createPromptNumericValue(form,prompt);


  // useEffect(() => {
  //   //TODO faut remettre les value source default quand on  clean le field
  //   if(defaultValues?.price && defaultValues?.weight) {
  //     return;
  //   }
  //   const priceState = form.getFieldState("price")
  //   const weightState = form.getFieldState("weight")


  //   const category = categories.find((c) => c.id == categoryId);
  //   const subcategory = category?.subcategories?.find(
  //     (c) => c.id == subcategoryId,
  //   );
  //   const source = subcategory ?? category;
  //   if (!source) return;

  //   if (!priceState.isDirty) {
  //     form.setValue("price", source.defaultPrice ?? 0);
  //   }
  //   if (!weightState.isDirty) {
  //     form.setValue("weight", source.defaultWeight ?? 0);
  //   }

  // }, [categoryId, subcategoryId, categories]);

  return (
    <>
      {PromptDialog}
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <FormCategorySubcategoryFields
            control={form.control}
            categories={categories}
            setValue={form.setValue}
            categoryLabel="Catégories"
            categoryEmptyOption={{ value: "", label: "Aucune" }}
          />

          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              control={form.control}
              name="weight"
              label="Poids (kg)"
              extra={{
                type: "number",
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
              {LABELED_ITEM_CONDITIONS.map((condition) => (
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

        </Grid>
      </form>
    </>
  );
};
