import { Grid, ListSubheader, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  FormInput,
  FormMultiSelect,
  FormSelect,
  FormSwitch,
  FormTime,
  type BaseFormProps,
} from "./FormBase";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CollectionPointModel, StoreModel } from "../../interfaces/Models";
import { DAYS_OF_WEEK as daysOfWeek } from "../../interfaces/shared";
import { idSchema } from "../../interfaces/ZodTypes";

const schema = z.object({
  day_of_week: z.string().nonempty("choissisez un jour"),
  is_active: z.boolean(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  notes: z.string(),
  store_id: z.union([idSchema(), z.literal("")]),
  location: z.array(z.string()).default([]),
});

export type Schema = z.infer<typeof schema>;

export const CollecteForm = ({
  formId,
  onSubmit,
  defaultValues,
  collectionPoints,
  stores,
}: BaseFormProps<Schema> & {
  collectionPoints: CollectionPointModel[];
  stores: StoreModel[];
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      day_of_week: "",
      is_active: true,
      start_time: new Date(new Date().setHours(9, 0)),
      end_time: new Date(new Date().setHours(17, 0)),
      notes: "",
      store_id: "",
      location: [],
      ...defaultValues ?? {},
    },
  });

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            label="Jour de la semaine"
            control={form.control}
            name="day_of_week"
          >
            {daysOfWeek.map((day) => (
              <MenuItem key={day.key} value={day.label}>
                {day.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSwitch
            control={form.control}
            label="Présent ce jour"
            name="is_active"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTime
            control={form.control}
            label="Heure de début"
            name="start_time"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTime
            control={form.control}
            label="Heure de fin"
            name="end_time"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect label="Magasin" control={form.control} name="store_id">
            <MenuItem key={"emptyStore"} value="">Aucun</MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                Magasin {store.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormMultiSelect
            control={form.control}
            name="location"
            label="Point de collecte"
            showCheckboxes
            renderValue={(selected) =>
              (selected ?? [])
                .map((item) => {
                  const [type, id] = item.split(".");
                  if (type === "point") {
                    return collectionPoints.find((point) => point.id === +id)?.name;
                  }
                  if (type === "store") {
                    return stores.find((store) => store.id === +id)?.name;
                  }
                  return undefined;
                })
                .filter(Boolean)
                .join(", ")
            }
          >
            <ListSubheader>Points de collecte</ListSubheader>
            {collectionPoints.map((point) => (
              <MenuItem key={`point.${point.id}`} value={`point.${point.id}`}>
                {point.name}
              </MenuItem>
            ))}
            <ListSubheader>Magasins</ListSubheader>
            {stores.map((store) => (
              <MenuItem key={`store.${store.id}`} value={`store.${store.id}`}>
                Magasin {store.name}
              </MenuItem>
            ))}
          </FormMultiSelect>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormInput
            control={form.control}
            label="Notes"
            name="notes"
            extra={{
              placeholder: "Instructions spéciales, détails importants...",
              multiline: true,
              rows: 3,
            }}
          />
        </Grid>
      </Grid>
    </form>
  );
};
