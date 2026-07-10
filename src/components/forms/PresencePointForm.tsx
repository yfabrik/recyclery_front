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
import type { CollectionPointModel } from "../../interfaces/Models";
import { idSchema, weekDays } from "../../interfaces/ZodTypes";
import { weekDaysArray } from "../../services/dateService";

const schema = z.object({
  collection_point_id: idSchema("un point de collecte est requis"),
  day_of_week: weekDays("choissisez un jour"),
  is_present: z.boolean(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  // is_24h: z.boolean(),
  notes: z.string().transform(v=>v==""?null:v),
});

export type Schema = z.infer<typeof schema>;
export type PresencePointFormValues = z.input<typeof schema>;

export const PresencePointForm = ({
  formId,
  onSubmit,
  collectionPoints,
  defaultValues,
}: BaseFormProps<PresencePointFormValues,Schema> & {
  collectionPoints: CollectionPointModel[];
}) => {
  // const scheduledDate =
  //   defaultValues && "scheduled_date" in defaultValues
  //     ? defaultValues.scheduled_date
  //     : undefined;
  // const dayOfWeek =
  //   defaultValues?.day_of_week ??
  //   (scheduledDate != null ? new Date(scheduledDate).getDay() : undefined);

  const form = useForm<PresencePointFormValues,unknown,Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      collection_point_id: "",
      is_present: true,
      start_time: new Date(new Date().setHours(9, 0)),
      end_time: new Date(new Date().setHours(17, 0)),
      notes: "",
      day_of_week: "",
      ...defaultValues,
      // ...(dayOfWeek !== undefined ? { day_of_week: dayOfWeek } : {}),
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
            <MenuItem key="all-points" value=""></MenuItem>
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
             <MenuItem key="all-days" value="">choisissez un jour</MenuItem>
            {weekDaysArray().map((day) => (
              <MenuItem
                key={day.key}
                value={day.key}
                sx={{ textTransform: "capitalize" }}
              >
                {typeof day.label === "string"
                  ? day.label.charAt(0).toUpperCase() + day.label.slice(1).toLowerCase()
                  : day.label}
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
