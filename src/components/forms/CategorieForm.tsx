import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";
import {
  FormIconSelect,
  FormInput,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";

interface CategorieFormProps extends BaseFormProps<Schema> {
  icons: string[];
}
export const schema = z.object({
  name: z.string().trim().nonempty("name required"),
  description: z.string().transform((v) => (v == "" ? null : v)),
  icon: z.string().transform((v) => (v == "" ? null : v)),
  defaultPrice: z.coerce.number().nonnegative().default(0),
  defaultWeight: z.coerce.number().nonnegative().default(0),
  parent_id: idSchema().nullable(),
  priceBasedOnWeight: z.boolean().default(false),
  bundlePrice: z.union([nullString(), z.coerce.number("nombre attendu").nonnegative("le nombre doit etre positif")]),
  bundleQuantity: z.union([nullString(), z.coerce.number("nombre attendu").nonnegative("le nombre doit etre positif")]),
});

export type Schema = z.infer<typeof schema>;

export const CategorieForm = ({
  icons,
  formId,
  onSubmit,
  defaultValues,
}: CategorieFormProps) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};

  const form = useForm({
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
      ...data,
    },
    resolver: zodResolver(schema),
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
        <FormInput
          control={form.control}
          label="poids par défaut"
          name="defaultWeight"
          extra={{ margin: "normal" }}
        />
      )}
      <FormInput
        control={form.control}
        label="prix par défaut"
        name="defaultPrice"
        extra={{ margin: "normal" }}
      />

      <FormInput
        control={form.control}
        label="produits par lots"
        name="bundleQuantity"
        extra={{
          type: "number",
          margin: "normal",
        }}
      />
      <FormInput
        control={form.control}
        label="prix des lots"
        name="bundlePrice"
        extra={{
          type: "number",
          margin: "normal",
        }}
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
