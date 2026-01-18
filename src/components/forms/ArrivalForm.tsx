import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add,
  Category,
  Clear,
  Home,
  LocalShipping,
  LocationOn,
  Save,
  Scale,
  TouchApp,
  VolunteerActivism
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Radio,
  Typography
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

import type {
  CategoryModel,
  CollectionPointModel,
} from "../../interfaces/Models";
import { FormDate, FormInput, FormRadio, FormSelect, FormTime, type BaseFormProps } from "./FormBase";
import { idSchema } from "../../interfaces/ZodTypes";

const sourceTypeEnum = z.enum([
  "point",
  "apport",
  "house_clearance",
]);

const schema = z
  .object({
    category_id: idSchema("La catégorie est requise"),
    subcategory_id: z.union([idSchema(), z.literal("").transform(v => null)]),
    weight: z.coerce.number().nonnegative("Le poids est requis"),
    arrival_date: z.coerce.date("La date est requise"),
    arrival_time: z.coerce.date("La date est requise"),
    source_type: sourceTypeEnum,
    collection_point_id: z.union([idSchema(), z.literal("").transform(v => null)]),
    source_details: z.string().transform(v => v == "" ? null : v),
    notes: z.string().transform(v => v == "" ? null : v),
  })
  .refine(
    (data) => {
      if (data.source_type === "point") {
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
  loading: boolean
};

export const ArrivalForm = ({
  formId,
  onSubmit,
  defaultValues,
  categories,
  collectionPoints,
  onWeightFieldClick,
  loading = false
}: ArrivalFormProps) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category_id: defaultValues?.category_id || "",
      subcategory_id: defaultValues?.subcategory_id || "",
      weight: defaultValues?.weight || "",
      arrival_date:
        defaultValues?.arrival_date || new Date(),
      arrival_time:
        defaultValues?.arrival_time || new Date(),
      source_type: defaultValues?.source_type || "point",
      collection_point_id: defaultValues?.collection_point_id || "",
      source_details: defaultValues?.source_details || "",
      notes: defaultValues?.notes || "",
    },
  });


  const categoryId = form.watch("category_id");
  const sourceType = form.watch("source_type");
  const weight = form.watch("weight");

  const collectionPointId = form.watch("collection_point_id");

  // Reset subcategory when category changes
  useEffect(() => {
    form.setValue("subcategory_id", "");
  }, [categoryId, form]);

  // Auto-fill collection point details when selected
  useEffect(() => {
    if (collectionPointId && sourceType === "point") {
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
    return categories.find(c => c.id == categoryId)?.subcategories || []

  };

  const sourceTypeOptions = [
    {
      value: "point" as const,
      label: "Point de Collecte",
      icon: <LocalShipping />,
    },
    {
      value: "apport" as const,
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
    <Grid size={{ xs: 12, lg: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <Add color="primary" />
          Nouvel Arrivage
        </Typography>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Catégorie */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                control={form.control}
                name="category_id"
                label="Catégorie"
              >
                {categories?.map((category) => (
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
                ))}
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
            </Grid>

            {/* Poids */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormInput
                control={form.control}
                name="weight"
                label="Poids (kg)"
                extra={{
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
                      // readOnly: true,
                    },
                  },
                }}
              />
            </Grid>

            {/* Date et heure */}
            <Grid size={{ xs: 6, md: 3 }}>
              <FormDate
                control={form.control}
                name="arrival_date"
                label="Date"
              />

            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <FormTime
                control={form.control}
                name="arrival_time"
                label="Heure"
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
              <FormRadio
                name="source_type"
                control={form.control}
                label="Provenance" >
                <Grid container spacing={2}>
                  {sourceTypeOptions.map((source) => (
                    <Grid size={{ xs: 12, md: 4 }} key={source.value}>
                      <FormControlLabel value={source.value} control={<Radio />} label={source.label} />
                    </Grid>
                  ))}
                </Grid>
              </FormRadio>
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
            {
              sourceType === "point" && (
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
              )
            }

            {
              (sourceType === "apport" ||
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
              )
            }

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
          </Grid >

        </form >
        <Box
          sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
        >
          <Button
            variant="outlined"
            size="large"
            type="reset"
            onClick={() => form.reset()}
            startIcon={<Clear />}
            sx={{ minWidth: 150, fontSize: "1.1rem" }}
          >
            Effacer
          </Button>
          <Button
            variant="contained"
            size="large"
            type="submit"
            form={formId}
            onClick={() => form.handleSubmit(onSubmit)}
            disabled={
              //   loading ||
              !categoryId ||
              // !weight ||
              !sourceType
            }
            startIcon={<Save />}
            sx={{ minWidth: 200, fontSize: "1.1rem" }}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </Box>
      </Paper>
    </Grid>
  );
};
