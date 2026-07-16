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
import * as z from "zod";

import type {
  CategoryModel,
  CollectionPointModel,
} from "../../interfaces/Models";
import { ARRIVAL_SOURCE_TYPES } from "../../constants/arrivalSourceTypes";
import { idSchema, nullString } from "../../interfaces/ZodTypes";
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
const sourceTypeEnum = z.enum(ARRIVAL_SOURCE_TYPES.map(s=>s.value));

const schema = (categories: CategoryModel[]) =>
  z
    .object({
      category_id: idSchema("La catégorie est requise"),
      subcategory_id: z.union([
        nullString(),
        idSchema(),
      ]),
      weight: z.coerce.number().positive("Le poids est requis"),
      arrival_date: z.coerce.date("La date est requise"),
      arrival_time: z.coerce.date("La date est requise"),
      source_type: sourceTypeEnum,
      collection_point_id: z.union([
        nullString(),
        idSchema(),
      ]),
      source_details: z.string().transform((v) => (v == "" ? null : v)),
      notes: z.string().transform((v) => (v == "" ? null : v)),
    })
    .superRefine((data, ctx) => {
      if (data.source_type === "point" && !data.collection_point_id)
        ctx.addIssue({
          code: "custom",
          path: ["collection_point_id"],
          message: "Veuillez sélectionner un point de collecte",
        });
      const selectedCategory = categories.find(
        (c) => c.id === Number(data.category_id),
      );
      const hasSubcategories =
        (selectedCategory?.subcategories?.length ?? 0) > 0;
      if (hasSubcategories && !data.subcategory_id) {
        ctx.addIssue({
          code: "custom",
          path: ["subcategory_id"],
          message: "Sous-categorie requise",
        });
      }
    });

export type ArrivalFormSchema = z.infer<ReturnType<typeof schema>>;
type ArrivalFormInput = z.input<ReturnType<typeof schema>>;

type ArrivalFormProps = BaseFormProps<ArrivalFormSchema> & {
  categories: CategoryModel[];
  collectionPoints: CollectionPointModel[];
  loading: boolean;
  onReady?: (method: { reset: UseFormReset<ArrivalFormSchema> }) => void;
};

export const ArrivalForm = ({
  formId,
  onSubmit,
  categories,
  collectionPoints,
  loading = false,
  onReady,
}: ArrivalFormProps) => {
  const form = useForm<ArrivalFormInput, unknown, ArrivalFormSchema>({
    resolver: zodResolver(schema(categories)),
    defaultValues: {
      category_id: "",
      subcategory_id: "",
      weight: "",
      arrival_date: new Date(),
      arrival_time: new Date(),
      source_type: "point",//TODO pas supposé possible le undefined
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
    onReady?.({ reset: reset as UseFormReset<ArrivalFormSchema> });
  }, [onReady, reset]);

  // Reset subcategory when category changes to avoid out-of-range select values.
  // useEffect(() => {
  //   form.setValue("subcategory_id", "");
  // }, [categoryId, form]);



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
                    onClick: async () =>
                      form.setValue(
                        "weight",
                        await prompt(
                          "",
                          form.getValues("weight")?.toString() || "",
                        ),
                      ),
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
