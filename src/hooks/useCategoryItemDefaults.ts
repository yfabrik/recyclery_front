import { useEffect } from "react";
import type {
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";
import type { CategoryModel } from "../interfaces/Models";

type CategoryDefaultsForm<TFieldValues extends FieldValues> = Pick<
  UseFormReturn<TFieldValues>,
  "getFieldState" | "setValue"
>;

type UseCategoryItemDefaultsOptions<TFieldValues extends FieldValues> = {
  form: CategoryDefaultsForm<TFieldValues>;
  categories: CategoryModel[];
  categoryId: unknown;
  subcategoryId: unknown;
  skipWhenPrefilled?: boolean;
  prefilledPrice?: number;
  prefilledWeight?: number;
  onDefaults?: (ctx: {
    category: CategoryModel | undefined;
    subcategory: CategoryModel | undefined;
    source: CategoryModel | undefined;
  }) => void;
};

export const useCategoryItemDefaults = <TFieldValues extends FieldValues>({
  form,
  categories,
  categoryId,
  subcategoryId,
  skipWhenPrefilled = false,
  prefilledPrice,
  prefilledWeight,
  onDefaults,
}: UseCategoryItemDefaultsOptions<TFieldValues>) => {
  useEffect(() => {
    if (skipWhenPrefilled && prefilledPrice && prefilledWeight) {
      return;
    }

    const priceField = "price" as Path<TFieldValues>;
    const weightField = "weight" as Path<TFieldValues>;

    const priceState = form.getFieldState(priceField);
    const weightState = form.getFieldState(weightField);

    const category = categories.find((c) => c.id == categoryId);
    const subcategory = category?.subcategories?.find(
      (c) => c.id == subcategoryId,
    );
    const source = subcategory ?? category;
    if (!source) return;

    if (!priceState.isDirty) {
      form.setValue(
        priceField,
        (source.defaultPrice ?? 0) as PathValue<TFieldValues, Path<TFieldValues>>,
      );
    }
    if (!weightState.isDirty) {
      form.setValue(
        weightField,
        (source.defaultWeight ?? 0) as PathValue<TFieldValues, Path<TFieldValues>>,
      );
    }

    onDefaults?.({ category, subcategory, source });
  }, [
    categoryId,
    subcategoryId,
    categories,
    form,
    skipWhenPrefilled,
    prefilledPrice,
    prefilledWeight,
    onDefaults,
  ]);
};
