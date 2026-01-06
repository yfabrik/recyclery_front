import { zodResolver } from "@hookform/resolvers/zod";
import {
    CalendarToday,
    Home,
    LocalShipping,
    LocationOn,
    Scale,
    TouchApp,
    VolunteerActivism
} from "@mui/icons-material";
import {
    Box,
    Card,
    CardContent,
    Grid,
    MenuItem,
    Typography
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import type {
    CategoryModel,
    CollectionPointModel,
} from "../../interfaces/Models";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";

const sourceTypeEnum = z.enum([
  "collection_point",
  "volunteer_donation",
  "house_clearance",
]);

const schema = z
  .object({
    category_id: z.string().nonempty("La catégorie est requise"),
    subcategory_id: z.string().optional(),
    weight: z.string().nonempty("Le poids est requis"),
    arrival_date: z.string().nonempty("La date est requise"),
    arrival_time: z.string().optional(),
    source_type: sourceTypeEnum,
    collection_point_id: z.string().optional(),
    source_details: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.source_type === "collection_point") {
        return !!data.collection_point_id;
      }
      return true;
    },
    {
      message: "Veuillez sélectionner un point de collecte",
      path: ["collection_point_id"],
    }
  );

export type ArrivalFormSchema = z.infer<typeof schema>;

type ArrivalFormProps = BaseFormProps<ArrivalFormSchema> & {
  categories: CategoryModel[];
  collectionPoints: CollectionPointModel[];
  onWeightFieldClick: () => void;
};

export const ArrivalForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
  collectionPoints,
  onWeightFieldClick,
}: ArrivalFormProps) => {
  const form = useForm<ArrivalFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: defaultValues?.category_id || "",
      subcategory_id: defaultValues?.subcategory_id || "",
      weight: defaultValues?.weight || "",
      arrival_date:
        defaultValues?.arrival_date || new Date().toISOString().split("T")[0],
      arrival_time:
        defaultValues?.arrival_time || new Date().toTimeString().slice(0, 5),
      source_type: defaultValues?.source_type || "collection_point",
      collection_point_id: defaultValues?.collection_point_id || "",
      source_details: defaultValues?.source_details || "",
      notes: defaultValues?.notes || "",
    },
  });

  const categoryId = form.watch("category_id");
  const sourceType = form.watch("source_type");
  const collectionPointId = form.watch("collection_point_id");

  // Reset subcategory when category changes
  useEffect(() => {
    form.setValue("subcategory_id", "");
  }, [categoryId, form]);

  // Auto-fill collection point details when selected
  useEffect(() => {
    if (collectionPointId && sourceType === "collection_point") {
      const selectedPoint = collectionPoints.find(
        (p) => p.id == collectionPointId
      );
      if (selectedPoint) {
        // You can add these fields to the schema if needed
        // For now, we just track the selection
      }
    }
  }, [collectionPointId, sourceType, collectionPoints]);

  const getSubcategories = () => {
    return [];
    const selectedCategory = categories.find((cat) => cat.id == categoryId);
    return selectedCategory?.subcategories || [];
  };

  const sourceTypeOptions = [
    {
      value: "collection_point" as const,
      label: "Point de Collecte",
      icon: <LocalShipping />,
    },
    {
      value: "volunteer_donation" as const,
      label: "Apport Volontaire",
      icon: <VolunteerActivism />,
    },
    {
      value: "house_clearance" as const,
      label: "Vide Maison",
      icon: <Home />,
    },
  ];

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        {/* Catégorie */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            control={form.control}
            name="category_id"
            label="Catégorie"
          >
            {/* {categories?.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Category />
                  {category.name}
                </Box>
              </MenuItem>
            ))} */}
          </FormSelect>
        </Grid>

        {/* Sous-catégorie */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            name="subcategory_id"
            control={form.control}
            label="Sous-catégorie"
            extra={{ disabled: !categoryId }}
          >
            <MenuItem value="">Aucune</MenuItem>
            {getSubcategories()?.map((subcategory) => (
              <MenuItem key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </MenuItem>
            ))}
          </FormSelect>
          {/* <Controller
            name="subcategory_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <FormControl fullWidth disabled={!categoryId}>
                <InputLabel id="subcategory_id_label">
                  Sous-catégorie
                </InputLabel>
                <Select
                  labelId="subcategory_id_label"
                  label="Sous-catégorie"
                  {...field}
                  error={fieldState.invalid}
                >
                  <MenuItem value="">Aucune</MenuItem>
                  {getSubcategories().map((subcategory) => (
                    <MenuItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </MenuItem>
                  ))}
                </Select>
                {fieldState.invalid && (
                  <FormHelperText>{fieldState.error?.message}</FormHelperText>
                )}
              </FormControl>
            )}
          /> */}
        </Grid>

        {/* Poids */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            control={form.control}
            name="weight"
            label="Poids (kg)"
            extra={{
              required: true,
              onClick: onWeightFieldClick,
              placeholder: "Cliquez pour saisir le poids",
              sx: {
                "& .MuiInputBase-input": {
                  fontSize: "1.2rem",
                  padding: "16px 14px",
                  cursor: "pointer",
                  backgroundColor: "#f8f9fa",
                },
                "& .MuiInputBase-root:hover": {
                  backgroundColor: "#e3f2fd",
                },
              },
              slotProps: {
                input: {
                  startAdornment: (
                    <Scale sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                  endAdornment: (
                    <TouchApp sx={{ ml: 1, color: "primary.main" }} />
                  ),
                  readOnly: true,
                },
              },
            }}
          />
        </Grid>

        {/* Date et heure */}
        <Grid size={{ xs: 6, md: 3 }}>
          <FormInput
            control={form.control}
            name="arrival_date"
            label="Date"
            extra={{
              required: true,
              type: "date",
              slotProps: {
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <CalendarToday sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                },
              },
              sx: {
                "& .MuiInputBase-input": {
                  fontSize: "1.1rem",
                  padding: "16px 14px",
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <FormInput
            control={form.control}
            name="arrival_time"
            label="Heure"
            extra={{
              type: "time",
              slotProps: { inputLabel: { shrink: true } },
              sx: {
                "& .MuiInputBase-input": {
                  fontSize: "1.1rem",
                  padding: "16px 14px",
                },
              },
            }}
          />
        </Grid>

        {/* Type de source */}
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Provenance
          </Typography>
          <Grid container spacing={2}>
            {sourceTypeOptions.map((source) => (
              <Grid size={{ xs: 12, md: 4 }} key={source.value}>
                <Controller
                  name="source_type"
                  control={form.control}
                  render={({ field }) => (
                    <Card
                      sx={{
                        cursor: "pointer",
                        border:
                          field.value === source.value
                            ? "2px solid #1976d2"
                            : "1px solid #e0e0e0",
                        backgroundColor:
                          field.value === source.value ? "#e3f2fd" : "white",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        minHeight: 100,
                      }}
                      onClick={() => {
                        field.onChange(source.value);
                        // Reset related fields when source type changes
                        form.setValue("collection_point_id", "");
                        form.setValue("source_details", "");
                      }}
                    >
                      <CardContent sx={{ textAlign: "center" }}>
                        <Box
                          sx={{
                            color:
                              field.value === source.value
                                ? "#1976d2"
                                : "text.secondary",
                            mb: 1,
                          }}
                        >
                          {source.icon}
                        </Box>
                        <Typography
                          variant="body1"
                          fontWeight={
                            field.value === source.value ? "bold" : "normal"
                          }
                        >
                          {source.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Détails selon le type de source */}
        {sourceType === "collection_point" && (
          <Grid size={{ xs: 12 }}>
            <FormSelect
              control={form.control}
              name="collection_point_id"
              label="Point de Collecte"
            >
              {collectionPoints.map((point) => (
                <MenuItem key={point.id} value={point.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <LocationOn />
                    <Box>
                      <Typography variant="body1">{point.name}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {point.city}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>
        )}

        {(sourceType === "volunteer_donation" ||
          sourceType === "house_clearance") && (
          <Grid size={{ xs: 12 }}>
            <FormInput
              control={form.control}
              name="source_details"
              label="Détails supplémentaires"
              extra={{
                multiline: true,
                rows: 2,
                placeholder:
                  "Informations complémentaires sur la provenance...",
                sx: {
                  "& .MuiInputBase-input": { fontSize: "1.1rem" },
                },
              }}
            />
          </Grid>
        )}

        {/* Notes */}
        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            name="notes"
            label="Notes"
            extra={{
              multiline: true,
              rows: 3,
              placeholder: "Observations, état des objets, remarques...",
              sx: {
                "& .MuiInputBase-input": { fontSize: "1.1rem" },
              },
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};
