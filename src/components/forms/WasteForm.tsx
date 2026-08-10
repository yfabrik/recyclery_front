import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FORM_DISPOSAL_TYPES } from "../../constants/disposalTypes";
import type { CategoryModel, EcoOrgModel } from "../../interfaces/Models";
import {
  wasteFormSchema,
  type WasteFormOutput,
  type WasteFormValues,
} from "../../services/schema/waste";
import {
  FormCategorySubcategoryFields,
  FormDate,
  FormInput,
  FormNumber,
  FormSelect,
  type BaseFormProps,
} from "./FormBase";

export type { WasteFormOutput, WasteFormValues };

type WasteFormProps = BaseFormProps<WasteFormValues, WasteFormOutput> & {
  categories: CategoryModel[];
  ecoOrganisms: EcoOrgModel[];
};

export const WasteForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
  ecoOrganisms,
}: WasteFormProps) => {
  const form = useForm<WasteFormValues, unknown, WasteFormOutput>({
    resolver: zodResolver(wasteFormSchema(categories)),
    defaultValues: {
      disposal_date: new Date(),
      disposal_type: "eco_organism",
      category_id: "",
      subcategory_id: "",
      eco_organism_id: "",
      weight_kg: 0,
      volume_m3: 0,
      transport_method: "",
      transport_company: "",
      transport_cost: 0,
      notes: "",
      ...defaultValues ?? {},
    },
  });

  const disposalType = form.watch("disposal_type");

  useEffect(() => {
    if (disposalType !== "eco_organism") {
      form.setValue("eco_organism_id", "");
    }
  }, [disposalType, form]);

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
            {FORM_DISPOSAL_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
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
        <FormCategorySubcategoryFields
          control={form.control}
          categories={categories}
          setValue={form.setValue}
          gridSize={{ xs: 12, sm: 6 }}
          hideWhenEmpty={true}
          categoryEmptyOption={{ value: "", label: "Sélectionner une catégorie" }}
          emptyOptionLabel="Sélectionner une sous-catégorie"
        />

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormNumber
            control={form.control}
            name="weight_kg"
            label="Poids (kg)"
            extra={{
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
          <FormNumber
            control={form.control}
            name="volume_m3"
            label="Volume (m³)"
            extra={{
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
          <FormNumber
            control={form.control}
            name="transport_cost"
            label="Coût du transport (€)"
            extra={{
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
