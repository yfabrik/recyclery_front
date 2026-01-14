import { Box, Button, Grid, MenuItem, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormDate,
  FormInput,
  FormSelect,
  FormTime,
  type BaseFormProps,
} from "./FormBase";
import { PRIORITIES as priorities } from "../../interfaces/shared";
import { useEffect } from "react";

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
  category: z.string("La tâche est requise").nonempty("La tâche est requise"),
  scheduled_date: z.date("La date est requise"),
  start_time: z.date("L'heure de début est requise"),
  end_time: z.date("L'heure de fin est requise"),
  priority: z.string().nonempty("La priorité est requise"),
  store_id: z.union([z.string(), z.number()]).optional().nullable(),
  reccurence_pattern: z.union([z.string(), z.number()]).optional().nullable(),
  notes: z.string().optional(),
});

type Schema = z.infer<typeof schema>;

type ScheduleFormProps = BaseFormProps<Schema> & {
  stores: StoreOption[];
};

export const PlaningForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores,
}: ScheduleFormProps) => {
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "",
      start_time:  new Date(new Date().setHours(9, 0)),
      end_time: new Date(new Date().setHours(17, 0)),
      notes: "",
      priority: "medium",
      reccurence_pattern: "",
      scheduled_date: new Date(),
      store_id: "",

      ...(defaultValues || {}),
    },
  });

  const handleQuickTimeSlot = (slot: "morning" | "afternoon") => {
    if (slot === "morning") {
      form.setValue("start_time",  new Date(new Date().setHours(8, 0)));
      form.setValue("end_time", new Date(new Date().setHours(12, 0)));
    } else {
      form.setValue("start_time", new Date(new Date().setHours(13, 30)));
      form.setValue("end_time",  new Date(new Date().setHours(17, 0)));
    }
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect control={form.control} name="category" label="Tâche">
            <MenuItem value="vente">Vente</MenuItem>
            <MenuItem value="point">Precense point collecte</MenuItem>
            <MenuItem value="collection">Collecte</MenuItem>
            <MenuItem value="custom">tache spéciale</MenuItem>

            {/* <MenuItem value="vente">Vente - Création manuelle</MenuItem>
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
            )} */}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormDate control={form.control} name="scheduled_date" label="Date" />
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

        {/* <Grid size={{ xs: 12, sm: 6 }}>
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
        </Grid> */}
        <Grid size={{ xs: 12 }}>
          <FormSelect
            control={form.control}
            name="reccurence_pattern"
            label="Récurrence"
          >
            <MenuItem value="">Aucune</MenuItem>
            <MenuItem value="daily">Journaliere</MenuItem>
            <MenuItem value="weekly">hebdomadaire</MenuItem>
            <MenuItem value="monthly">mensuel</MenuItem>
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
