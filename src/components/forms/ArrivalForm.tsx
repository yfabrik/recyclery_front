import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add,
  Clear,
  LocationOn,
  Save,
  Scale,
  TouchApp,
} from "@mui/icons-material";
import { Box, Button, Grid, MenuItem, Paper, Typography } from "@mui/material";
import { useEffect } from "react";
import { useForm, useWatch, type UseFormReset } from "react-hook-form";

import { ARRIVAL_SOURCE_TYPES } from "../../constants/arrivalSourceTypes";
import { createPromptNumericValue } from "../../hooks/useSetNumericValue";
import type {
  CategoryModel,
  CollectionPointModel,
} from "../../interfaces/Models";
import {
  arrivalFormSchema,
  type ArrivalFormOutput,
  type ArrivalFormValues,
} from "../../services/schema/arrival";
import { usePrompt } from "../Prompt";
import {
  FormCategorySubcategoryFields,
  FormDate,
  FormInput,
  FormRadio,
  FormRadioCard,
  FormSelect,
  FormTime,
  type BaseFormProps,
} from "./FormBase";

export type { ArrivalFormOutput, ArrivalFormValues };
/** @deprecated Use ArrivalFormOutput */
export type ArrivalFormSchema = ArrivalFormOutput;

type ArrivalFormProps = BaseFormProps<ArrivalFormValues, ArrivalFormOutput> & {
  categories: CategoryModel[];
  collectionPoints: CollectionPointModel[];
  loading: boolean;
  onReady?: (method: { reset: UseFormReset<ArrivalFormValues> }) => void;
};

export const ArrivalForm = ({
  formId,
  onSubmit,
  categories,
  collectionPoints,
  loading = false,
  onReady,
}: ArrivalFormProps) => {
  const form = useForm<ArrivalFormValues, unknown, ArrivalFormOutput>({
    resolver: zodResolver(arrivalFormSchema(categories)),
    defaultValues: {
      category_id: "",
      subcategory_id: "",
      weight: "",
      arrival_date: new Date(),
      arrival_time: new Date(),
      source_type: "point",
      collection_point_id: "",
      source_details: "",
      notes: "",
    },
  });

  // const SubCategories = ({ control }: { control: typeof form.control }) => {
  //   const category = useWatch({
  //     control: control,
  //     name: "category_id",
  //   });
  //   const subcategoryId = useWatch({
  //     control: control,
  //     name: "subcategory_id",
  //   });
  //   const subcats =
  //     categories.find((c) => c.id == category)?.subcategories ?? [];

  //   const hasValidSubcategory =
  //     subcategoryId === "" ||
  //     subcats.some((cat) => String(cat.id) === String(subcategoryId));

  //   useEffect(() => {
  //     if (!hasValidSubcategory) {
  //       form.setValue("subcategory_id", "");
  //     }
  //   }, [hasValidSubcategory]);

  //   if (subcats.length === 0 || !hasValidSubcategory) return null;

  //   return (
  //     <FormSelect
  //       control={control}
  //       name="subcategory_id"
  //       label="Sous-catégorie"
  //       extra={{ disabled: subcats.length < 1 }}
  //     >
  //       <MenuItem value="">Aucune</MenuItem>
  //       {subcats.map((cat) => (
  //         <MenuItem key={cat.id} value={cat.id}>
  //           <Box
  //             sx={{
  //               display: "flex",
  //               alignItems: "center",
  //               gap: 1,
  //             }}
  //           >
  //             {cat.icon ? (
  //               <SelectedIcon iconName={cat.icon || "Category"} />
  //             ) : (
  //               <Category />
  //             )}
  //             {cat.name}
  //           </Box>
  //         </MenuItem>
  //       ))}
  //     </FormSelect>
  //   );
  // };

  const CollectionPoint = ({ control }: { control: typeof form.control }) => {
    const sourceType = useWatch({
      control: control,
      name: "source_type",
    });
    if (sourceType !== "point") return (
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
    )
    return (
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
                <Typography variant="body1">
                  {point.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {point.city}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </FormSelect>
    )
  };

  // const categoryId = form.watch("category_id");

  const { prompt, PromptDialog } = usePrompt();

  const reset = form.reset;
  useEffect(() => {
    onReady?.({ reset });
  }, [onReady, reset]);

  // Reset subcategory when category changes to avoid out-of-range select values.
  // useEffect(() => {
  //   form.setValue("subcategory_id", "");
  // }, [categoryId, form]);

  const setNumericField = createPromptNumericValue(form,prompt);

  return (
    <>
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
              <FormCategorySubcategoryFields
                control={form.control}
                categories={categories}
                setValue={form.setValue}
              />

              {/* Poids */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormInput
                  control={form.control}
                  name="weight"
                  label="Poids (kg)"
                  extra={{
                      onClick: () => setNumericField("weight", "Kg"),
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
                  label="Provenance"
                >
                  <Grid container spacing={2}>
                    {ARRIVAL_SOURCE_TYPES.map((source) => (
                      <Grid size={{ xs: 12, md: 4 }} key={source.value}>
                        <FormRadioCard
                          label={source.label}
                          icon={source.icon}
                          value={source.value}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </FormRadio>
              </Grid>

              {/* Détails selon le type de source */}
              <Grid size={{ xs: 12 }}>
                <CollectionPoint control={form.control} />
              </Grid>


              {/* {(sourceType === "apport" ||
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
                )} */}

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
                // disabled={loading || !categoryId || !weight || !sourceType}
                startIcon={<Save />}
                sx={{ minWidth: 200, fontSize: "1.1rem" }}
                loading={loading}
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Grid>
      {PromptDialog}
    </>
  );
};
