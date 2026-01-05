import { Grid, MenuItem } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  FormInput,
  FormSelect,
  type BaseFormProps,
} from "./FormBase";

type Category = {
  id: number;
  name: string;
};

type Subcategory = {
  id: number;
  name: string;
  category_id: number;
};

type EcoOrganism = {
  id: number;
  name: string;
};

const disposalTypeEnum = z.enum(["eco_organism", "landfill", "other"]);

const schema = z.object({
  disposal_date: z.string().nonempty("La date de sortie est requise"),
  disposal_type: disposalTypeEnum,
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  eco_organism_id: z.string().optional(),
  weight_kg: z.string().nonempty("Le poids est requis"),
  volume_m3: z.string().optional(),
  transport_method: z.string().optional(),
  transport_company: z.string().optional(),
  transport_cost: z.string().optional(),
  notes: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

type WasteFormProps = BaseFormProps<Schema> & {
  categories: Category[];
  subcategories: Subcategory[];
  ecoOrganisms: EcoOrganism[];
  onWeightFieldClick: () => void;
};

export const WasteForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
  subcategories,
  ecoOrganisms,
  onWeightFieldClick,
}: WasteFormProps) => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      disposal_date: defaultValues?.disposal_date || "",
      disposal_type: defaultValues?.disposal_type || "eco_organism",
      category_id: defaultValues?.category_id || "",
      subcategory_id: defaultValues?.subcategory_id || "",
      eco_organism_id: defaultValues?.eco_organism_id || "",
      weight_kg: defaultValues?.weight_kg || "",
      volume_m3: defaultValues?.volume_m3 || "",
      transport_method: defaultValues?.transport_method || "",
      transport_company: defaultValues?.transport_company || "",
      transport_cost: defaultValues?.transport_cost || "",
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

  useEffect(() => {
    // reset subcategory when category changes
    form.setValue("subcategory_id", "");
  }, [categoryId, form]);

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="disposal_date"
            label="Date de sortie"
            extra={{
              type: "date",
              slotProps: { inputLabel: { shrink: true } },
              required: true,
            }}
          />
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
            {subcategories
              .filter(
                (sub) =>
                  categoryId &&
                  sub.category_id === parseInt(categoryId as string, 10)
              )
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
              required: true,
              onClick: onWeightFieldClick,
              sx: {
                cursor: "pointer",
                "& .MuiInputBase-input": {
                  cursor: "pointer",
                },
              },
              slotProps: {
                input: {
                  readOnly: true,
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
