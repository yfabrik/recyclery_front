import { TASK_PRIORITIES as API_TASK_PRIORITIES } from "@recyclerie/api/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Chip, Grid, MenuItem, Typography } from "@mui/material";
import { useForm, useWatch, type Control } from "react-hook-form";

import {
  DAYS_OF_WEEK,
} from "../../interfaces/shared";
import {
  RECURRENCE_PATTERN_FORM_OPTIONS,
} from "../../constants/recurrencePatterns";
import { TASK_CATEGORIES } from "../../constants/taskCategories";
import { TASK_PRIORITIES } from "../../constants/taskPriorities";
import type { EmployeeModel } from "../../interfaces/Models";
import {
  taskFormSchema,
  type TaskFormOutput,
  type TaskFormValues,
} from "../../services/schema/task";
import { omitNullish } from "../../services/zodTransform";
import {
  FormDate,
  FormInput,
  FormSelect,
  FormTime,
  type BaseFormProps,
} from "./FormBase";

export type TaskFormSchema = TaskFormOutput;
export type { TaskFormOutput, TaskFormValues };

const FORM_PRIORITIES = TASK_PRIORITIES.filter((priority) =>
  (API_TASK_PRIORITIES as readonly string[]).includes(priority.value),
);

export type TaskFormProps = BaseFormProps<TaskFormValues, TaskFormOutput> & {
  employees: EmployeeModel[];
};

export const RecurseWatch = ({
  control,
}: {
  control: Control<TaskFormValues>;
}) => {
  const recurse = useWatch({
    control,
    name: "recurrence_pattern",
  });
  if (recurse == "daily")
    return (
      <FormSelect control={control} name="scheduled_date" label="Jour">
        {DAYS_OF_WEEK.map((day) => (
          <MenuItem key={day.value} value={day.value}>
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
  const data = defaultValues ? omitNullish(defaultValues) : {};
  const form = useForm<TaskFormValues, unknown, TaskFormOutput>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "collection",
      priority: "medium",
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
              onChange: (e) => {
                const raw = e.target.value;
                form.setValue(
                  "hourly_rate",
                  raw === "" ? "" : Number(raw),
                  { shouldValidate: true, shouldDirty: true },
                );
              },
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
            {FORM_PRIORITIES.map((priority) => (
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
                <MenuItem key={day.value} value={day.value}>
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
