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
import type {
  WorkdaysFormPayload,
  WorkdaysModelTransformed,
} from "../../services/api/users";
import { formatTime, weekdayLabel } from "../../services/dateService";
import { formWeekday } from "../../interfaces/ZodTypes";
import { FormTime, type BaseFormProps } from "./FormBase";

const workdaySchema = z.object({
  start_time: z.date(),
  end_time: z.date(),
  is_working: z.boolean(),
  time_slot: z.enum(WORKDAY_TIME_SLOT_VALUES),
  day_of_week: formWeekday("jour requis").refine(
    (v): v is 0 | 1 | 2 | 3 | 4 | 5 | 6 => v !== "",
    { message: "jour requis" },
  ),
});
const schema = z.object({
  week1: z.array(workdaySchema),
  week2: z.array(workdaySchema),
});

export type WorkdayFormValues = z.input<typeof workdaySchema>;
export type FormValues = z.input<typeof schema>;
export type FormOutput = z.infer<typeof schema>;
/** @deprecated Form output to parent is WorkdaysFormPayload after mapping. */
export type Schema = WorkdaysFormPayload;
/** @deprecated Use WorkdayFormValues */
export type Workday = WorkdaysFormPayload["week1"][number];
/** @deprecated Use WorkdayFormValues */
export type WorkdayInput = WorkdayFormValues;

function toWorkdaysPayload(data: FormOutput): WorkdaysFormPayload {
  const mapDay = (
    day: FormOutput["week1"][number],
  ): WorkdaysFormPayload["week1"][number] => ({
    day_of_week: day.day_of_week,
    start_time: formatTime(day.start_time),
    end_time: formatTime(day.end_time),
    is_working: day.is_working,
    time_slot: day.time_slot,
  });
  return {
    week1: data.week1.map(mapDay),
    week2: data.week2.map(mapDay),
  };
}

export const EmployeeWorkdaysForm = ({
  formId,
  onSubmit,
  defaults,
}: BaseFormProps<FormValues, WorkdaysFormPayload> & {
  defaults?: WorkdaysModelTransformed[];
}) => {
  const [tabValue, setTabValue] = useState(0);

  const fillWithDefault = (
    def?: WorkdaysModelTransformed[],
  ): WorkdayFormValues[] => {
    return WEEKDAYS_MONDAY_FIRST.flatMap((day) => {
      return WORKDAY_TIME_SLOT_VALUES.map((slot) => {
        const found = def?.find(
          (d) => d.day_of_week === day && d.time_slot === slot,
        );
        if (found) {
          return {
            day_of_week: found.day_of_week,
            start_time: found.start_time,
            end_time: found.end_time,
            is_working: found.is_working,
            time_slot: found.time_slot,
          };
        }
        return {
          day_of_week: day,
          start_time: new Date(
            new Date().setHours(slot == "morning" ? 8 : 13, 0),
          ),
          end_time: new Date(
            new Date().setHours(slot == "morning" ? 12 : 17, 0),
          ),
          is_working: false,
          time_slot: slot,
        };
      });
    });
  };

  const form = useForm<FormValues, unknown, FormOutput>({
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
    <form
      id={formId}
      onSubmit={form.handleSubmit((data) => onSubmit(toWorkdaysPayload(data)))}
    >
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
  control: Control<FormValues>;
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
  control: Control<FormValues>;
  name: `week1.${number}` | `week2.${number}`;
  slot: WorkdayFormValues["time_slot"];
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
