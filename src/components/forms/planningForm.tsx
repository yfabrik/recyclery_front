import { Box, Button, Grid, MenuItem, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";
import { PRIORITIES as priorities } from "../../interfaces/shared";

type TaskOption = {
  id: number | string;
  name: string;
  category: string;
};

type PriorityOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
};

type StoreOption = {
  id: number | string;
  name: string;
};

type LocationOption = {
  id: number | string;
  name: string;
  store_id: number;
};

const schema = z.object({
  task_id: z.union([z.string(), z.number()], {
    message: "La tâche est requise",
  }),
  scheduled_date: z.string().nonempty("La date est requise"),
  start_time: z.string().nonempty("L'heure de début est requise"),
  end_time: z.string().nonempty("L'heure de fin est requise"),
  priority: z.string().nonempty("La priorité est requise"),
  store_id: z.union([z.string(), z.number()]).optional().nullable(),
  location_id: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

type ScheduleFormProps = BaseFormProps<Schema> & {
  tasks: TaskOption[];
  priorityOptions: PriorityOption[];
  stores: StoreOption[];
  locations: LocationOption[];
};

export const PlaningForm = ({
  formId,
  onSubmit,
  defaultValues,
  tasks,
  priorityOptions,
  stores,
  locations,
}: ScheduleFormProps) => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      task_id: defaultValues?.task_id ?? "",
      scheduled_date: defaultValues?.scheduled_date || "",
      start_time: defaultValues?.start_time || "",
      end_time: defaultValues?.end_time || "",
      priority: defaultValues?.priority || "",
      store_id: defaultValues?.store_id ?? "",
      location_id: defaultValues?.location_id ?? "",
      notes: defaultValues?.notes || "",
    },
  });

  const handleQuickTimeSlot = (slot: "morning" | "afternoon") => {
    if (slot === "morning") {
      form.setValue("start_time", "08:00");
      form.setValue("end_time", "12:00");
    } else {
      form.setValue("start_time", "13:30");
      form.setValue("end_time", "17:00");
    }
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} name="task_id" label="Tâche">
            <MenuItem value="vente">Vente - Création manuelle</MenuItem>
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <MenuItem key={task.id} value={task.id}>
                  {task.name} ({task.category})
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>
                Aucune tâche disponible
                <br />
                <small style={{ fontSize: "0.7em", color: "#666" }}>
                  Créez des tâches dans la section "Gestion des Tâches"
                </small>
              </MenuItem>
            )}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            name="scheduled_date"
            label="Date"
            extra={{
              type: "date",
              slotProps: { inputLabel: { shrink: true } },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="start_time"
            label="Heure de début"
            extra={{
              type: "time",
              slotProps: { inputLabel: { shrink: true } },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormInput
            control={form.control}
            name="end_time"
            label="Heure de fin"
            extra={{
              type: "time",
              slotProps: { inputLabel: { shrink: true } },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: "#666", fontWeight: "bold" }}
          >
            Configuration rapide des horaires
          </Typography>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={() => handleQuickTimeSlot("morning")}
              sx={{
                borderColor: "#4caf50",
                color: "#4caf50",
                "&:hover": {
                  borderColor: "#45a049",
                  backgroundColor: "#f1f8e9",
                },
                px: 3,
                py: 1.5,
                borderRadius: "20px",
              }}
            >
              🌅 Matin (8h - 12h)
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleQuickTimeSlot("afternoon")}
              sx={{
                borderColor: "#ff9800",
                color: "#ff9800",
                "&:hover": {
                  borderColor: "#f57c00",
                  backgroundColor: "#fff3e0",
                },
                px: 3,
                py: 1.5,
                borderRadius: "20px",
              }}
            >
              🌞 Après-midi (13h30 - 17h)
            </Button>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} name="priority" label="Priorité">
            {priorities.map((priority) => (
              <MenuItem key={priority.value} value={priority.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {priority.icon}
                  {priority.label}
                </Box>
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} name="store_id" label="Magasin">
            <MenuItem value="">
              <em>Sélectionner un magasin</em>
            </MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            control={form.control}
            name="location_id"
            label="Lieu spécifique"
          >
            <MenuItem value="">
              <em>Tous les lieux</em>
            </MenuItem>
            {locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            name="notes"
            label="Notes"
            extra={{
              multiline: true,
              rows: 3,
              placeholder: "Instructions spéciales, détails importants...",
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};
