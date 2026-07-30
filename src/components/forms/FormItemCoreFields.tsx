import { Euro, Scale } from "@mui/icons-material";
import { Grid } from "@mui/material";
import type {
  Control,
  FieldValues,
  Path,
  PathValue,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import type { CategoryModel } from "../../interfaces/Models";
import { FormCategorySubcategoryFields, FormInput } from "./FormBase";

export interface ItemCoreFormValues {
  category_id: unknown;
  subcategory_id: unknown;
  weight: unknown;
  price: unknown;
  description: string;
}

type FormItemCoreFieldsProps<
  TFieldValues extends ItemCoreFormValues,
  TTransformedValues extends FieldValues = TFieldValues,
> = {
  control: Control<TFieldValues, unknown, TTransformedValues>;
  categories: CategoryModel[];
  setValue: UseFormSetValue<TFieldValues>;
  getValues: UseFormGetValues<TFieldValues>;
  prompt: (
    title: string,
    defaultValue: string,
    options?: { unit?: string },
  ) => Promise<string | null>;
  weightLabel?: string;
  descriptionLabel?: string;
  descriptionRows?: number;
  descriptionPlaceholder?: string;
  categoryLabel?: string;
  categoryEmptyOption?: { value: string | number; label: string };
};

export const FormItemCoreFields = <
  TFieldValues extends ItemCoreFormValues,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  control,
  categories,
  setValue,
  getValues,
  weightLabel = "Poids (kg)",
  descriptionLabel = "Description",
  descriptionRows = 3,
  descriptionPlaceholder = "Description détaillée de l'article...",
  categoryLabel,
  categoryEmptyOption,
  prompt,
}: FormItemCoreFieldsProps<TFieldValues, TTransformedValues>) => {
  type WeightPath = Path<TFieldValues> & "weight";
  type PricePath = Path<TFieldValues> & "price";

  const weightField = "weight" as WeightPath;
  const priceField = "price" as PricePath;
  const descriptionField = "description" as Path<TFieldValues>;

  const promptInputSx = {
    "& .MuiInputBase-input": {
      cursor: "pointer",
      backgroundColor: "#f8f9fa",
    },
  };

  return (
    <>
      <FormCategorySubcategoryFields
        control={control}
        categories={categories}
        setValue={setValue}
        categoryLabel={categoryLabel}
        categoryEmptyOption={categoryEmptyOption}
      />

      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          control={control}
          name={weightField}
          label={weightLabel}
          extra={{
            type: "number",
            onClick: async () =>
              setValue(
                weightField,
                Number(
                  (await prompt(
                    "",
                    getValues(weightField)?.toString() || "",
                    { unit: "Kg" },
                  )) ?? 0,
                ) as PathValue<TFieldValues, WeightPath>,
                { shouldDirty: true, shouldTouch: true },
              ),
            sx: promptInputSx,
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
          control={control}
          name={priceField}
          label="Prix de vente (€)"
          extra={{
            type: "number",
            onClick: async () =>
              setValue(
                priceField,
                Number(
                  (await prompt(
                    "",
                    getValues(priceField)?.toString() || "",
                    { unit: "€" },
                  )) ?? 0,
                ) as PathValue<TFieldValues, PricePath>,
                { shouldDirty: true, shouldTouch: true },
              ),
            sx: promptInputSx,
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

      <Grid size={{ xs: 12 }}>
        <FormInput
          control={control}
          name={descriptionField}
          label={descriptionLabel}
          extra={{
            multiline: true,
            rows: descriptionRows,
            placeholder: descriptionPlaceholder,
          }}
        />
      </Grid>
    </>
  );
};
