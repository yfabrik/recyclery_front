import { zodResolver } from "@hookform/resolvers/zod";
import {
  WbSunny,
  WbSunnyOutlined,
  WbTwilight,
  WbTwilightOutlined,
} from "@mui/icons-material";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import z from "zod";
import { FormTime, type BaseFormProps } from "./FormBase";
import type { WorkdaysModel } from "../../interfaces/Models";

const workdaySchema = z.object({
  start_time: z
    .date()
    .transform((val) =>
      val.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
    ),
  end_time: z
    .date()
    .transform((val) =>
      val.toLocaleTimeString("fr", { hour: "2-digit", minute: "2-digit" }),
    ),
  is_working: z.boolean(),
  time_slot: z.enum(["morning", "afternoon"]),
  day_of_week: z.string(),
});
const schema = z.object({
  week1: z.array(workdaySchema),
  week2: z.array(workdaySchema),
});

export type Workday = z.infer<typeof workdaySchema>;

export type Schema = z.infer<typeof schema>;

export const EmployeeWorkdaysForm = ({
  formId,
  onSubmit,
  defaultValues,
  defaults,
}: BaseFormProps<Schema> & { defaults: WorkdaysModel[] }) => {
  const [tabValue, setTabValue] = useState(0);

  const workdays: z.infer<typeof workdaySchema>[] = [
    1, 2, 3, 4, 5, 6, 0,
  ].flatMap((day) => {
    return (["morning", "afternoon"] as const).map((slot) => {
      const today = new Intl.DateTimeFormat("fr", {
        weekday: "long",
      }).format(new Date(1970, 0, 4 + day));
      return (
        defaults.find(
          (def) => def.day_of_week === today && def.time_slot === slot,
        ) || {
          day_of_week: today,
          end_time: new Date(),
          start_time: new Date(),
          is_working: false,
          time_slot: slot,
        }
      );
    });
  });

  const fillWithDefault = (
    def: WorkdaysModel[],
  ): z.infer<typeof workdaySchema>[] => {
    return [1, 2, 3, 4, 5, 6, 0].flatMap((day) => {
      return (["morning", "afternoon"] as const).map((slot) => {
        const today = new Intl.DateTimeFormat("fr", {
          weekday: "long",
        }).format(new Date(1970, 0, 4 + day));
        return (
          def.find((d) => d.day_of_week === today && d.time_slot === slot) || {
            day_of_week: today,
            start_time: new Date(
              new Date().setHours(slot == "morning" ? 8 : 13, 0),
            ),
            end_time: new Date(
              new Date().setHours(slot == "morning" ? 12 : 17, 0),
            ),
            is_working: false,
            time_slot: slot,
          }
        );
      });
    });
  };

  const form = useForm({
    defaultValues: {
      week1: [
        ...fillWithDefault(
          defaults.filter(
            (d) =>
              !Object.hasOwn(d, "week") || d.week == "week1" || d.week == null,
          ),
        ),
      ],
      week2: [...fillWithDefault(defaults.filter((d) => d.week == "week2"))],
    },
    resolver: zodResolver(schema),
  });

  const { fields, append, remove } = useFieldArray({
    name: "week1",
    control: form.control,
  });
  const { fields: fields2 } = useFieldArray({
    name: "week2",
    control: form.control,
  });

  const working1 = form.watch("week1");
  const working2 = form.watch("week2");

  useEffect(() => console.log(working1), [working1]);

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
        <Tab label="semaine 1" value={0} />
        <Tab label="semaine 2" value={1} />
      </Tabs>
      <Grid container spacing={2} alignItems="center">
        {tabValue == 0 &&
          fields.map((field, index) => (
            <>
              {!(index % 2) && (
                <Grid size={{ xs: 3 }}>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    textTransform={"capitalize"}
                  >
                    {field.day_of_week}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 4.5 }} key={field.id}>
                <HalfDay
                  control={form.control}
                  day={field.day_of_week}
                  isWorking={working1[index].is_working}
                  name={`week1.${index}`}
                  slot={field.time_slot}
                />
              </Grid>
            </>
          ))}

        {tabValue == 1 &&
          fields2.map((field, index) => (
            <>
              {" "}
              {!(index % 2) && (
                <Grid size={{ xs: 3 }}>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    textTransform={"capitalize"}
                  >
                    {field.day_of_week}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 4.5 }} key={field.id}>
                <HalfDay
                  control={form.control}
                  day={field.day_of_week}
                  isWorking={working2[index].is_working}
                  name={`week2.${index}`}
                  slot={field.time_slot}
                />
              </Grid>
            </>
          ))}
      </Grid>
    </form>
  );
};

const Horaires = ({
  control,
  index,
}: {
  control: Control<Schema, unknown, Schema>;
  index: number;
}) => {
  const working1 = useWatch({
    name: "week1",
    control,
  });
  const working2 = useWatch({
    name: "week2",
    control,
  });

  return (
    <>
      {working1[index].is_working && (
        <Box
          sx={{
            mt: 1,
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <FormTime
            label="Début"
            control={control}
            name={`${name}.start_time`}
          />

          <Typography variant="body2">-</Typography>
          <FormTime label="fin" control={control} name={`${name}.end_time`} />
        </Box>
      )}
    </>
  );
};

interface HalfDayProps {
  isWorking: boolean;
  control: Control<Schema, unknown, Schema>;
  name: `week1.${number}` | `week2.${number}`;
  slot: Workday["time_slot"];
  day: string;
}
const HalfDay = ({ isWorking, slot, day, control, name }: HalfDayProps) => {
  return (
    <Box
      sx={{
        p: 2,
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        bgcolor: isWorking ? "#f1f8e9" : "#fafafa",
        borderColor: isWorking ? "#4caf50" : "#e0e0e0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          width: "100%",
          height: "100%",
        }}
      >
        <Controller
          control={control}
          name={`${name}.is_working`}
          render={({ field }) => (
            <FormControlLabel
              {...field}
              control={
                <Checkbox
                  icon={
                    slot == "morning" ? (
                      <WbSunnyOutlined />
                    ) : (
                      <WbTwilightOutlined />
                    )
                  }
                  checkedIcon={slot == "morning" ? <WbSunny /> : <WbTwilight />}
                  checked={field.value}
                />
              }
              label={`${day} - ${slot == "morning" ? "Matin" : "Après-midi"}`}
              sx={{
                width: "100%",
                height: "100%",
              }}
            />
          )}
        />
      </Box>
      {isWorking && (
        <Box
          sx={{
            mt: 1,
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <FormTime
            label="Début"
            control={control}
            name={`${name}.start_time`}
          />

          <Typography variant="body2">-</Typography>
          <FormTime label="fin" control={control} name={`${name}.end_time`} />
        </Box>
      )}
    </Box>
  );
};
