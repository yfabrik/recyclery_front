import z from "zod";
import {
  WORKDAY_TIME_SLOT_VALUES,
} from "../../constants/workdayTimeSlots";
import { formWeekday } from "../../interfaces/ZodTypes";

export const workdayFormSchema = z.object({
  start_time: z.date(),
  end_time: z.date(),
  is_working: z.boolean(),
  time_slot: z.enum(WORKDAY_TIME_SLOT_VALUES),
  day_of_week: formWeekday("jour requis").refine(
    (v): v is 0 | 1 | 2 | 3 | 4 | 5 | 6 => v !== "",
    { message: "jour requis" },
  ),
});

export const employeeWorkdaysFormSchema = z.object({
  week1: z.array(workdayFormSchema),
  week2: z.array(workdayFormSchema),
});

export type WorkdayFormValues = z.input<typeof workdayFormSchema>;
export type WorkdayFormOutput = z.infer<typeof workdayFormSchema>;
export type EmployeeWorkdaysFormValues = z.input<
  typeof employeeWorkdaysFormSchema
>;
export type EmployeeWorkdaysFormOutput = z.infer<
  typeof employeeWorkdaysFormSchema
>;
