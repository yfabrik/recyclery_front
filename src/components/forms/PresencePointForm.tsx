import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTime,
  type BaseFormProps,
} from "./FormBase";

import { zodResolver } from "@hookform/resolvers/zod";
import { DAYS_OF_WEEK as daysOfWeek } from "../../interfaces/shared";
import { idSchema } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";
import type { CollectionPointModel } from "../../interfaces/Models";

const schema = z.object({
  collection_point_id: idSchema("un point de collecte est requis"),
  day_of_week: z.string().nonempty("choissisez un jour"),
  is_present: z.boolean(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  // is_24h: z.boolean(),
  notes: z.string(),
});

export type Schema = z.infer<typeof schema>;

export const PresencePointForm = ({
  formId,
  onSubmit,
  collectionPoints,
  defaultValues,
}: BaseFormProps<Schema> & {
  collectionPoints: CollectionPointModel[];
}) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {}

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      collection_point_id: "",
      day_of_week: "",
      is_present: true,
      start_time: new Date().setHours(9, 0),//TODO j'aime pas la date null
      end_time: new Date().setHours(17, 0),
      // is_24h: false,
      notes: "",
      ...data
    },
  });
  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            control={form.control}
            label="Point de collecte"
            name="collection_point_id"
          >
            {collectionPoints.map((point) => (
              <MenuItem key={point.id} value={point.id}>
                {point.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>

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
          {/* //TODO FIXME  j'aime pas le type time*/}
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
          <FormSwitch
            control={form.control}
            label="Présent ce jour"
            name="is_present"
          />
        </Grid>
        {/* <Grid size={{ xs: 12 }}>
          <FormSwitch
            control={form.control}
            name="is_24h"
            label="Présent 24h/24"
          />
        </Grid> */}
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
