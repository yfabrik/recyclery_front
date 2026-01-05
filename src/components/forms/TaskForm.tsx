import {
  Box,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";
import {
  PRIORITIES as priorities,
  RECURRENCE_PATTERNS as recurrencePatterns,
} from "../../interfaces/shared";

const schema = z.object({
  name: z.string().nonempty("Le nom de la tâche est requis"),
  hourly_rate: z.coerce.number().optional(),
  description: z.string().optional(),
  category: z.string().nonempty("La catégorie est requise"),
  priority: z.string().nonempty("La priorité est requise"),
  estimated_duration: z.coerce
    .number()
    .min(15, "Minimum 15 minutes")
    .max(480, "Maximum 480 minutes"),
  location: z.string().optional(),
  assigned_to: z.union([z.string(), z.number()]).optional().nullable(),
  required_skills: z.array(z.string()).default([]),
  equipment_needed: z.array(z.string()).default([]),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
  notes: z.string().optional(),
});

export type TaskFormSchema = z.infer<typeof schema>;

type CategoryOption = {
  value: string;
  label: string;
  icon?: string;
};

type PriorityOption = {
  value: string;
  label: string;
};

type EmployeeOption = {
  id: number;
  username: string;
  role: string;
};

type RecurrencePatternOption = {
  value: string;
  label: string;
};

export type TaskFormProps = BaseFormProps<TaskFormSchema> & {
  //   categories: CategoryOption[];
  //   priorities: PriorityOption[];
  employees: EmployeeOption[];
  //   skillsOptions: string[];
  //   equipmentOptions: string[];
  //   recurrencePatterns: RecurrencePatternOption[];
};

export const TaskForm = ({
  formId,
  onSubmit,
  defaultValues,
  //   categories,
  //   priorities,
  employees,
  //   skillsOptions,
  //   equipmentOptions,
  //   recurrencePatterns,
}: TaskFormProps) => {
  const categories = [
    { value: "collection", label: "Collecte", icon: "🚛", color: "primary" },
    { value: "sorting", label: "Tri", icon: "♻️", color: "secondary" },
    {
      value: "maintenance",
      label: "Maintenance",
      icon: "🔧",
      color: "warning",
    },
    { value: "sales", label: "Vente", icon: "💰", color: "success" },
    {
      value: "administration",
      label: "Administration",
      icon: "📋",
      color: "info",
    },
    { value: "cleaning", label: "Nettoyage", icon: "🧹", color: "default" },
    { value: "transport", label: "Transport", icon: "🚚", color: "primary" },
    { value: "training", label: "Formation", icon: "🎓", color: "secondary" },
  ];

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

  const form = useForm<TaskFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      category: defaultValues?.category || "collection",
      priority: defaultValues?.priority || "medium",
      estimated_duration:
        defaultValues?.estimated_duration !== undefined
          ? defaultValues.estimated_duration
          : 60,
      required_skills: defaultValues?.required_skills || [],
      location: defaultValues?.location || "",
      equipment_needed: defaultValues?.equipment_needed || [],
      hourly_rate: defaultValues?.hourly_rate ?? "",
      is_recurring: defaultValues?.is_recurring ?? false,
      recurrence_pattern: defaultValues?.recurrence_pattern || "none",
      assigned_to: defaultValues?.assigned_to ?? "",
      notes: defaultValues?.notes || "",
    },
  });

  const requiredSkills = form.watch("required_skills") || [];
  const equipmentNeeded = form.watch("equipment_needed") || [];
  const isRecurring = form.watch("is_recurring");

  const toggleArrayField = (
    field: "required_skills" | "equipment_needed",
    value: string
  ) => {
    const current = form.getValues(field) || [];
    if (current.includes(value)) {
      form.setValue(
        field,
        current.filter((item: string) => item !== value)
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
            extra={{ required: true }}
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
                {category.icon && <span>{category.icon} </span>}
                {category.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} name="priority" label="Priorité">
            {priorities.map((priority) => (
              <MenuItem key={priority.value} value={priority.value}>
                {priority.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="estimated_duration"
            label="Durée estimée (minutes)"
            extra={{
              type: "number",
              inputProps: { min: 15, max: 480 },
            }}
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
                  {employee.username} ({employee.role})
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

        <Grid size={{ xs: 12 }}>
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
        </Grid>

        {isRecurring && (
          <Grid size={{ xs: 12 }}>
            <FormSelect
              control={form.control}
              name="recurrence_pattern"
              label="Modèle de récurrence"
            >
              {recurrencePatterns.map((pattern) => (
                <MenuItem key={pattern.value} value={pattern.value}>
                  {pattern.label}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>
        )}

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
