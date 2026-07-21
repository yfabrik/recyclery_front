import { zodResolver } from "@hookform/resolvers/zod";
import type { Weekday } from "@recyclerie/api/enums";
import { WEEKDAYS_MONDAY_FIRST } from "@recyclerie/api/domain/date";
import {
  WbSunny,
  WbSunnyOutlined,
  WbTwilight,
  WbTwilightOutlined,
} from "@mui/icons-material";
import { Box, Checkbox, Grid, Tab, Tabs, Typography } from "@mui/material";
import { Fragment, useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import z from "zod";
import {
  WORKDAY_TIME_SLOT_VALUES,
  getWorkdayTimeSlotLabel,
} from "../../constants/workdayTimeSlots";
import type { WorkdaysModelTransformed } from "../../services/api/users";
import { formatTime, weekdayLabel } from "../../services/dateService";
import { weekDays } from "../../interfaces/ZodTypes";
import { FormTime, type BaseFormProps } from "./FormBase";

const workdaySchema = z.object({
  start_time: z.date().transform((val) => formatTime(val)),
  end_time: z.date().transform((val) => formatTime(val)),
  is_working: z.boolean(),
  time_slot: z.enum(WORKDAY_TIME_SLOT_VALUES),
  day_of_week: weekDays("jour requis"),
});
const schema = z.object({
  week1: z.array(workdaySchema),
  week2: z.array(workdaySchema),
});

export type Workday = z.output<typeof workdaySchema>;
export type WorkdayInput = z.input<typeof workdaySchema>;

export type Schema = z.output<typeof schema>;
export type FormValues = z.input<typeof schema>;

export const EmployeeWorkdaysForm = ({
  formId,
  onSubmit,
  defaults,//TODO use as default value
}: BaseFormProps<Schema> & { defaults?: WorkdaysModelTransformed[] }) => {
  const [tabValue, setTabValue] = useState(0);

  const fillWithDefault = (
    def?: WorkdaysModelTransformed[],
  ): WorkdayInput[] => {
    return WEEKDAYS_MONDAY_FIRST.flatMap((day) => {
      return WORKDAY_TIME_SLOT_VALUES.map((slot) => {
        return (
          def?.find((d) => d.day_of_week === day && d.time_slot === slot) || {
            day_of_week: day,
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

  const form = useForm<FormValues, unknown, Schema>({
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

  const { fields } = useFieldArray({
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
        onChange={(_e, val) => setTabValue(val)}
        variant="fullWidth"
        sx={{ width: "100%", marginBottom: 2 }}
      >
        <Tab label="semaine 1" value={0} />
        <Tab label="semaine 2" value={1} />
      </Tabs>
      <Grid container spacing={2} alignItems="center">
        {tabValue == 0 &&
          fields.map((field, index) => (
            <Fragment key={field.id}>
              {!(index % 2) && (
                <Grid size={{ xs: 3 }} key={`week1-label-${field.day_of_week}`}>
                  <Typography variant="body1" fontWeight="medium">
                    {weekdayLabel(field.day_of_week as Weekday)}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 4.5 }} key={`week1-slot-${field.id}`}>
                <HalfDay
                  control={form.control}
                  day={field.day_of_week as Weekday}
                  name={`week1.${index}`}
                  slot={field.time_slot}
                />
              </Grid>
            </Fragment>
          ))}

        {tabValue == 1 &&
          fields2.map((field, index) => (
            <Fragment key={field.id}>
              {!(index % 2) && (
                <Grid size={{ xs: 3 }} key={`week2-label-${field.day_of_week}`}>
                  <Typography variant="body1" fontWeight="medium">
                    {weekdayLabel(field.day_of_week as Weekday)}
                  </Typography>
                </Grid>
              )}
              <Grid size={{ xs: 4.5 }} key={`week2-slot-${field.id}`}>
                <HalfDay
                  control={form.control}
                  day={field.day_of_week as Weekday}
                  name={`week2.${index}`}
                  slot={field.time_slot}
                />
              </Grid>
            </Fragment>
          ))}
      </Grid>
    </form>
  );
};

const Horaires = ({
  control,
  name,
}: {
  control: Control<FormValues, unknown, Schema>;
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
  control: Control<FormValues, unknown, Schema>;
  name: `week1.${number}` | `week2.${number}`;
  slot: Workday["time_slot"];
  day: Weekday;
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
              {`${weekdayLabel(day)} - ${getWorkdayTimeSlotLabel(slot)}`}
            </Box>
          </Box>
          <Horaires control={control} name={name} />
        </Box>
      )}
    />
  );
};
