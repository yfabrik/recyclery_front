import { Grid, MenuItem } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  FormDate,
  FormInput,
  FormSelect,
  type BaseFormProps,
} from "./FormBase";
import { idSchema } from "../../interfaces/ZodTypes";

type Category = {
  id: number;
  name: string;
  subcategories: Category[]
};


type EcoOrganism = {
  id: number;
  name: string;
};

const disposalTypeEnum = z.enum(["eco_organism", "landfill", "other"]);

const schema = z.object({
  disposal_date: z.coerce.date("La date de sortie est requise"),
  disposal_type: disposalTypeEnum,
  category_id: idSchema("categorie requis"),
  subcategory_id: z.union([idSchema(), z.literal("").transform(val => null)]),
  eco_organism_id: z.union([idSchema(), z.literal("").transform(val => null)]),
  weight_kg: z.coerce.number().positive("Le poids est requis"),
  volume_m3: z.coerce.number().nonnegative().default(0),
  transport_method: z.string().transform(v => v == "" ? null : v),
  transport_company: z.string().transform(v => v == "" ? null : v),
  transport_cost: z.coerce.number().nonnegative().default(0),
  notes: z.string().transform(v => v == "" ? null : v),
});

type Schema = z.infer<typeof schema>;

type WasteFormProps = BaseFormProps<Schema> & {
  categories: Category[];
  ecoOrganisms: EcoOrganism[];
  onWeightFieldClick: () => void;
};

export const WasteForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
  ecoOrganisms,
  onWeightFieldClick,
}: WasteFormProps) => {
  console.log(defaultValues)
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      disposal_date: defaultValues?.disposal_date || new Date(),
      disposal_type: defaultValues?.disposal_type || "eco_organism",
      category_id: defaultValues?.category_id || "",
      subcategory_id: defaultValues?.subcategory_id || "",
      eco_organism_id: defaultValues?.eco_organism_id || "",
      weight_kg: defaultValues?.weight_kg || 0,
      volume_m3: defaultValues?.volume_m3 || "",
      transport_method: defaultValues?.transport_method || "",
      transport_company: defaultValues?.transport_company || "",
      transport_cost: defaultValues?.transport_cost || 0,
      notes: defaultValues?.notes || "",

    },
  });

  const disposalType = form.watch("disposal_type");
  const categoryId = form.watch("category_id");

  useEffect(() => {
    if (disposalType !== "eco_organism") {
      form.setValue("eco_organism_id", "");
    }
  }, [disposalType, form]);

  const subcategories = () => {
    return categoryId ? categories.find(c => c.id == categoryId)?.subcategories || [] : []
  }
  useEffect(() => {
    // reset subcategory when category changes
    form.setValue("subcategory_id", "");
  }, [categoryId, form]);

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDate
            control={form.control}
            name="disposal_date"
            label="Date de sortie" />

        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            control={form.control}
            name="disposal_type"
            label="Type de sortie"
          >
            <MenuItem value="eco_organism">Éco-organisme</MenuItem>
            <MenuItem value="landfill">Déchetterie</MenuItem>
            <MenuItem value="other">Autre</MenuItem>
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            control={form.control}
            name="category_id"
            label="Catégorie"
          >
            <MenuItem value="">Sélectionner une catégorie</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            control={form.control}
            name="subcategory_id"
            label="Sous-catégorie"
          >
            <MenuItem value="">Sélectionner une sous-catégorie</MenuItem>
            {subcategories()
              .map((subcategory) => (
                <MenuItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </MenuItem>
              ))}
          </FormSelect>
        </Grid>

        {disposalType === "eco_organism" && (
          <Grid size={{ xs: 12 }}>
            <FormSelect
              control={form.control}
              name="eco_organism_id"
              label="Éco-organisme"
            >
              <MenuItem value="">Sélectionner un éco-organisme</MenuItem>
              {ecoOrganisms.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>
        )}

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="weight_kg"
            label="Poids (kg)"
            extra={{
              type: "number",
              onClick: onWeightFieldClick,
              sx: {
                cursor: "pointer",
                "& .MuiInputBase-input": {
                  cursor: "pointer",
                },
              },
              slotProps: {
                input: {
                  // readOnly: true,
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="volume_m3"
            label="Volume (m³)"
            extra={{
              type: "number",
              inputProps: { step: 0.01 },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="transport_method"
            label="Méthode de transport"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="transport_company"
            label="Entreprise de transport"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            name="transport_cost"
            label="Coût du transport (€)"
            extra={{
              type: "number",
              inputProps: { step: 0.01 },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            name="notes"
            label="Notes"
            extra={{
              multiline: true,
              rows: 3,
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};
