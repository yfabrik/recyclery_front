import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  categoryFormSchema,
  type CategoryFormOutput,
  type CategoryFormValues,
} from "../../services/schema/category";
import {
  FormIconSelect,
  FormInput,
  FormNumber,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";

export type { CategoryFormOutput, CategoryFormValues };

interface CategorieFormProps extends BaseFormProps<CategoryFormValues,CategoryFormOutput> {
  icons: string[];
}

export const CategorieForm = ({
  icons,
  formId,
  onSubmit,
  defaultValues,
}: CategorieFormProps) => {
  const form = useForm<CategoryFormValues, unknown, CategoryFormOutput>({
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      defaultPrice: 0,
      defaultWeight: 0,
      parent_id: null,
      priceBasedOnWeight: false,
      bundlePrice: "",
      bundleQuantity: "",
      ...defaultValues ?? {},
    },
    resolver: zodResolver(categoryFormSchema),
  });

  const prixAuKg = form.watch("priceBasedOnWeight");

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput
        control={form.control}
        label="Nom de la catégorie"
        name="name"
        extra={{ margin: "normal" }}
      />
      <FormSwitch
        control={form.control}
        label="prix au Kg ?"
        name="priceBasedOnWeight"
      />
      {!prixAuKg && (
        <FormNumber
          control={form.control}
          label="poids par défaut"
          name="defaultWeight"
          extra={{ margin: "normal" }}
        />
      )}
      <FormNumber
        control={form.control}
        label="prix par défaut"
        name="defaultPrice"
        extra={{ margin: "normal" }}
      />

      <FormNumber
        control={form.control}
        label="produits par lots"
        name="bundleQuantity"
        extra={{ margin: "normal" }}
      />
      <FormNumber
        control={form.control}
        label="prix des lots"
        name="bundlePrice"
        extra={{ margin: "normal" }}
      />
      <FormInput
        control={form.control}
        label="Description"
        name="description"
        extra={{
          multiline: true,
          rows: 3,
          margin: "normal",
        }}
      />


      <FormIconSelect
        control={form.control}
        label="Icône"
        name="icon"
        extra={{ iconNames: icons }}
      />
    </form>
  );
};
