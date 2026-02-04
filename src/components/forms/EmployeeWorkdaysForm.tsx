import { zodResolver } from "@hookform/resolvers/zod";
import {
  WbSunny,
  WbSunnyOutlined,
  WbTwilight,
  WbTwilightOutlined,
} from "@mui/icons-material";
import { Box, Checkbox, Grid, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
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
}: BaseFormProps<Schema> & { defaults?: WorkdaysModel[] }) => {
  const [tabValue, setTabValue] = useState(0);

  // const workdays: z.infer<typeof workdaySchema>[] = [
  //   1, 2, 3, 4, 5, 6, 0,
  // ].flatMap((day) => {
  //   return (["morning", "afternoon"] as const).map((slot) => {
  //     const today = new Intl.DateTimeFormat("fr", {
  //       weekday: "long",
  //     }).format(new Date(1970, 0, 4 + day));
  //     return (
  //       defaults.find(
  //         (def) => def.day_of_week === today && def.time_slot === slot,
  //       ) || {
  //         day_of_week: today,
  //         end_time: new Date(),
  //         start_time: new Date(),
  //         is_working: false,
  //         time_slot: slot,
  //       }
  //     );
  //   });
  // });

  const fillWithDefault = (
    def?: WorkdaysModel[],
  ): z.infer<typeof workdaySchema>[] => {
    return [1, 2, 3, 4, 5, 6, 0].flatMap((day) => {
      return (["morning", "afternoon"] as const).map((slot) => {
        const today = new Intl.DateTimeFormat("fr", {
          weekday: "long",
        }).format(new Date(1970, 0, 4 + day));
        return (
          def?.find((d) => d.day_of_week === today && d.time_slot === slot) || {
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
          defaults?.filter(
            (d) =>
              !Object.hasOwn(d, "week") || d.week == "week1" || d.week == null,
          ),
        ),
      ],
      week2: [...fillWithDefault(defaults?.filter((d) => d.week == "week2"))],
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

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Tabs
        value={tabValue}
        onChange={(e, val) => setTabValue(val)}
        variant="fullWidth"
        sx={{ width: "100%", marginBottom: 2 }}
      >
        <Tab label="semaine 1" value={0} />
        <Tab label="semaine 2" value={1} />
      </Tabs>
      <Grid container spacing={2} alignItems="center">
        {tabValue == 0 &&
          fields.map((field, index) => (
            <>
              {!(index % 2) && (
                <Grid size={{ xs: 3  }}>
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
  name,
}: {
  control: Control<Schema, unknown, Schema>;
  name: `week1.${number}` | `week2.${number}`;
}) => {
  const isWorking = useWatch({
    control,
    name: `${name}.is_working`,
    defaultValue: false,
  });

  if (!isWorking) return null;

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: "flex",
        mt: 1,
        gap: 1,
        alignItems: "center",
      }}
    >
      <FormTime label="Début" control={control} name={`${name}.start_time`} />
      <Typography variant="body2">-</Typography>
      <FormTime label="fin" control={control} name={`${name}.end_time`} />
    </Box>
  );
};

interface HalfDayProps {
  control: Control<Schema, unknown, Schema>;
  name: `week1.${number}` | `week2.${number}`;
  slot: Workday["time_slot"];
  day: string;
}
const HalfDay = ({ slot, day, control, name }: HalfDayProps) => {
  const isWorking = useWatch({
    control,
    name: `${name}.is_working`,
    defaultValue: false,
  });

  return (
    <Controller
      control={control}
      name={`${name}.is_working`}
      render={({ field }) => (
        <Box
          onClick={() => field.onChange(!field.value)}
          sx={(theme) => ({
            display: "block",
            p: 2,
            border: "1px solid",
            borderRadius: 2,
            bgcolor: isWorking
              ? theme.palette.primary.light + "20"
              : theme.palette.background.paper,
            borderColor: isWorking
              ? theme.palette.primary.main
              : theme.palette.divider,
            cursor: "pointer",
          })}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
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
              onChange={field.onChange}
              onBlur={field.onBlur}
              onClick={(e) => e.stopPropagation()}
            />
            <Box component="span" sx={{ flex: 1 }}>
              {`${day} - ${slot == "morning" ? "Matin" : "Après-midi"}`}
            </Box>
          </Box>
          <Horaires control={control} name={name} />
        </Box>
      )}
    />
  );
};
