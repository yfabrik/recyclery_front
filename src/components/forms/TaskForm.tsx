import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Chip, Grid, MenuItem, Typography } from "@mui/material";
import { useForm, useWatch, type Control } from "react-hook-form";
import * as z from "zod";

import {
  DAYS_OF_WEEK,
} from "../../interfaces/shared";
import {
  RECURRENCE_PATTERN_FORM_OPTIONS,
} from "../../constants/recurrencePatterns";
import { TASK_PRIORITIES } from "../../constants/taskPriorities";
import {
  FormDate,
  FormInput,
  FormSelect,
  FormTime,
  type BaseFormProps,
} from "./FormBase";
import type { EmployeeModel } from "../../interfaces/Models";
import { emptyStringToNull } from "../../services/zodTransform";
import { TASK_CATEGORIES } from "../../constants/taskCategories";
import { noEmptyStr, nullString } from "../../interfaces/ZodTypes";
import { RECURRENCE_PATTERNS } from "@recyclerie/api/enums";
const recurrencePatternEnum = z.enum(RECURRENCE_PATTERNS);
const schema = z.object({
  name: noEmptyStr("Le nom de la tâche est requis"),
  hourly_rate: z.coerce.number().optional(),
  description: z
    .string()
    .trim()
    .transform((v) => (v == "" ? null : v)),
  category: noEmptyStr("La catégorie est requise"),
  priority: noEmptyStr("La priorité est requise"),
  // estimated_duration: z.coerce
  //   .number()
  //   .min(15, "Minimum 15 minutes")
  //   .max(480, "Maximum 480 minutes"),
  location: z
    .string()
    .trim()
    .transform((v) => (v == "" ? null : v)),
  assigned_to: z.union([z.string(), z.number()]).optional().nullable(),
  required_skills: z.array(z.string()).default([]),
  equipment_needed: z.array(z.string()).default([]),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.union([
    nullString(),
    recurrencePatternEnum,
  ]),
  notes: z
    .string()
    .trim()
    .transform((v) => (v == "" ? null : v)),
  scheduled_date: z.coerce.date(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
});

export type TaskFormSchema = z.infer<typeof schema>;

export type TaskFormProps = BaseFormProps<TaskFormSchema> & {
  employees: EmployeeModel[];
};

export const RecurseWatch = ({
  control,
}: {
  control: Control<TaskFormSchema>;
}) => {
  const recurse = useWatch({
    control,
    name: "recurrence_pattern",
  });
  if (recurse == "daily")
    return (
      <FormSelect control={control} name="scheduled_date" label="Jour">
        {DAYS_OF_WEEK.map((day) => (
          <MenuItem key={day.key} value={day.label}>
            {day.label}
          </MenuItem>
        ))}
      </FormSelect>
    );
  return <FormDate control={control} name="scheduled_date" label="Jour" />;
};

export const TaskForm = ({
  formId,
  onSubmit,
  defaultValues,
  employees,
}: TaskFormProps) => {
  const categories = TASK_CATEGORIES;

  const skillsOptions = [
    "Collecte",
    "Tri",
    "Vente",
    "Maintenance",
    "Conduite",
    "Gestion",
    "Informatique",
    "Communication",
    "Formation",
    "Nettoyage",
    "Sécurité",
    "Logistique",
  ];

  const equipmentOptions = [
    "Véhicule",
    "Chariot",
    "Gants",
    "Masque",
    "Outils",
    "Ordinateur",
    "Téléphone",
    "Radio",
    "Balance",
    "Scanner",
  ];
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "collection",
      priority: "medium",
      // estimated_duration:
      //   defaultValues?.estimated_duration !== undefined
      //     ? defaultValues.estimated_duration
      //     : 60,
      required_skills: [],
      location: "",
      equipment_needed: [],
      hourly_rate: "",
      is_recurring: false,
      recurrence_pattern: "",
      assigned_to: "",
      scheduled_date: new Date(),
      notes: "",
      start_time: new Date(),
      end_time: new Date(),
      ...data,
    },
  });

  const requiredSkills = form.watch("required_skills") || [];
  const equipmentNeeded = form.watch("equipment_needed") || [];
  // const isRecurring = form.watch("is_recurring");
  // const pattern = form.watch("recurrence_pattern");

  const toggleArrayField = (
    field: "required_skills" | "equipment_needed",
    value: string,
  ) => {
    const current = form.getValues(field) || [];
    if (current.includes(value)) {
      form.setValue(
        field,
        current.filter((item: string) => item !== value),
      );
    } else {
      form.setValue(field, [...current, value]);
    }
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="name"
            label="Nom de la tâche"
            // extra={{ required: true }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="hourly_rate"
            label="Taux horaire (€)"
            extra={{
              type: "number",
              inputProps: { step: 0.01 },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            name="description"
            label="Description"
            extra={{
              multiline: true,
              rows: 2,
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} name="category" label="Catégorie">
            {categories.map((category) => (
              <MenuItem key={category.value} value={category.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {category.icon}
                  {category.label}
                </Box>
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} name="priority" label="Priorité">
            {TASK_PRIORITIES.map((priority) => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTime
            control={form.control}
            name="start_time"
            label="Heure de début"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTime
            control={form.control}
            name="end_time"
            label="Heure de fin"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput control={form.control} name="location" label="Lieu" />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            control={form.control}
            name="assigned_to"
            label="Employé assigné"
          >
            <MenuItem value="">
              <em>Aucun employé assigné</em>
            </MenuItem>
            {employees && employees.length > 0 ? (
              employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.fullName} - Employee
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Aucun employé disponible</MenuItem>
            )}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom>
            Compétences requises
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {skillsOptions.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                onClick={() => toggleArrayField("required_skills", skill)}
                color={requiredSkills.includes(skill) ? "primary" : "default"}
                variant={requiredSkills.includes(skill) ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2" gutterBottom>
            Équipement nécessaire
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {equipmentOptions.map((equipment) => (
              <Chip
                key={equipment}
                label={equipment}
                onClick={() => toggleArrayField("equipment_needed", equipment)}
                color={
                  equipmentNeeded.includes(equipment) ? "secondary" : "default"
                }
                variant={
                  equipmentNeeded.includes(equipment) ? "filled" : "outlined"
                }
              />
            ))}
          </Box>
        </Grid>

        {/* <Grid size={{ xs: 12,sm:6 }}>
          <Controller
            name="is_recurring"
            control={form.control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={(_, checked) => field.onChange(checked)}
                  />
                }
                label="Tâche récurrente"
              />
            )}
          />
        </Grid> */}

        {/* {isRecurring && ( */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            control={form.control}
            name="recurrence_pattern"
            label="Modèle de récurrence"
          >
            {RECURRENCE_PATTERN_FORM_OPTIONS.map((pattern) => (
              <MenuItem key={pattern.value} value={pattern.value}>
                {pattern.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          {/* {pattern == "daily" ? (
            <FormSelect
              control={form.control}
              name="scheduled_date"
              label="Jour"
            >
              {DAYS_OF_WEEK.map((day) => (
                <MenuItem key={day.key} value={day.label}>
                  {day.label}
                </MenuItem>
              ))}
            </FormSelect>
          ) : (
            <FormDate
              control={form.control}
              name="scheduled_date"
              label="Jour"
            />
          )} */}
          {/* <RecurseWatch control={form.control} /> */}

          <FormDate control={form.control} name="scheduled_date" label="Jour" />
        </Grid>
        {/* )} */}

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
