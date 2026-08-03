import { Grid, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FormInput, FormMultiSelect, FormSwitch, type BaseFormProps } from "./FormBase";

import { zodResolver } from "@hookform/resolvers/zod";

import type { CategoryModel } from "../../interfaces/Models";
import {
  ecoOrganismFormSchema,
  type EcoOrganismFormOutput,
  type EcoOrganismFormValues,
} from "../../services/schema/ecoOrganism";
import { fetchCategories } from "../../services/api/categories";

export type { EcoOrganismFormOutput, EcoOrganismFormValues };

export const EcoOrganismForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<EcoOrganismFormValues, EcoOrganismFormOutput> & {
}) => {
  const {
    inCategories: rawInCategories,
    sellCategories: rawSellCategories,
    ...restDefaults
  } = defaultValues ?? {};

  const categoriesQuery = useQuery({
    queryKey: ["categories", { in: true, only_category: true }],
    queryFn: () => fetchCategories({ in: true, only_category: true, include: ["category"] }).then((response) => response.data.data),
  });
  const categoriesSellQuery = useQuery({
    queryKey: ["categories", { sell: true, only_category: true }],
    queryFn: () => fetchCategories({ sell: true, only_category: true, include: ["category"] }).then((response) => response.data.data),
  });

  const categoriesIn = categoriesQuery.data ?? [];
  const categoriesSell = categoriesSellQuery.data ?? [];
  const form = useForm<EcoOrganismFormValues, unknown, EcoOrganismFormOutput>({
    resolver: zodResolver(ecoOrganismFormSchema),
    defaultValues: {
      name: restDefaults.name ?? "",
      description: restDefaults.description ?? "",
      contact_email: restDefaults.contact_email ?? "",
      contact_phone: restDefaults.contact_phone ?? "",
      address: restDefaults.address ?? "",
      website: restDefaults.website ?? "",
      is_active: restDefaults.is_active ?? true,
      inCategories: Array.isArray(rawInCategories)
        ? (rawInCategories as Array<number | { id: number }>).map((cat) =>
            typeof cat === "number" ? cat : cat.id,
          )
        : [],
      sellCategories: Array.isArray(rawSellCategories)
        ? (rawSellCategories as Array<number | { id: number }>).map((cat) =>
            typeof cat === "number" ? cat : cat.id,
          )
        : [],
    },
  });
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <FormInput control={form.control} label="Nom *" name="name" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Description"
            name="description"
            extra={{ multiline: true, rows: 3 }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Email de contact"
            name="contact_email"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            label="Téléphone"
            name="contact_phone"
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Adresse"
            name="address"
            extra={{ multiline: true, rows: 2 }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput control={form.control} label="Site Web" name="website" />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormMultiSelect
            control={form.control}
            label="Catégories (Entrants)"
            name="inCategories"
          >
            {categoriesIn.map((category: CategoryModel) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </FormMultiSelect>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormMultiSelect
            control={form.control}
            label="Catégories (Ventes)"
            name="sellCategories"
          >
            {categoriesSell.map((category: CategoryModel) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </FormMultiSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormSwitch
            control={form.control}
            label="Éco-organisme actif"
            name="is_active"
          />
        </Grid>
      </Grid>
    </form>
  );
};
