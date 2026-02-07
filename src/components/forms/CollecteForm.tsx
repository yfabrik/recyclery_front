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
import { emptyStringToNull } from "../../services/zodTransform";

const schema = z.object({
  day_of_week: z.string().nonempty("choissisez un jour"),
  is_active: z.boolean(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  notes: z.string(),
});

export type Schema = z.infer<typeof schema>;

export const CollecteForm = ({
  formId,
  onSubmit,
  defaultValues,
}: BaseFormProps<Schema> & {}) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      day_of_week: "",
      is_active: true,
      start_time: new Date().setHours(9, 0),
      end_time: new Date().setHours(17, 0),
      notes: "",
      ...data,
    },
  });
  //   const is_24 = form.watch("is_24h");
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
