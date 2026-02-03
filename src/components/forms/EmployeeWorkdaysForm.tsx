import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, type Control } from "react-hook-form";
import z from "zod";
import { FormSwitch, FormTime, type BaseFormProps } from "./FormBase";


const workdaySchema = z.object({
    start_time: z.date(),
    end_time: z.date(),
    is_working: z.boolean(),
    slot_name: z.enum(["morning", "afternoon"]),
    day_of_week: z.string()

})
const schema = z.object({ week1: z.array(workdaySchema), week2: z.array(workdaySchema) })


export type Workday = z.infer<typeof workdaySchema>

export type Schema = z.infer<typeof schema>


export const EmployeeWorkdaysForm = ({ formId, onSubmit, defaultValues, defaults }: BaseFormProps<Schema> & { defaults: Workday[] }) => {

    const [tabValue, setTabValue] = useState(0)

    const workdays: z.infer<typeof workdaySchema>[] = [1, 2, 3, 4, 5, 6, 0].flatMap(day => {
        return (["morning", "afternoon"] as const).map(slot => {
            return defaults?.find(d => d.day_of_week == day && d.slot_name == slot) ??
            {
                day_of_week: new Intl.DateTimeFormat("fr", { weekday: "long" }).format(new Date(1970, 0, 4 + day)),
                end_time: new Date(),
                start_time: new Date(),
                is_working: false,
                slot_name: slot
            }
        })
    })

    const form = useForm({
        defaultValues: {
            week1: [...workdays],
            week2: [...workdays],

        },
        resolver: zodResolver(schema),
    });

    const { fields, append, remove } = useFieldArray({
        name: "week1",
        control: form.control
    });
    const { fields: fields2 } = useFieldArray({
        name: "week2",
        control: form.control
    });

    const working1 = form.watch("week1");
    const working2 = form.watch("week2");

    useEffect(() => console.log(working1), [working1])

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                <Tab label="semaine 1" value={0} />
                <Tab label="semaine 2" value={1} />
            </Tabs>
            {tabValue == 0 &&
                fields.map((field, index) => (
                    <Stack key={field.id} >
                        <HalfDay control={form.control} day={field.day_of_week} isWorking={working1[index].is_working} name={`week1.${index}`} slot={field.slot_name} />
                    </Stack>
                ))}

            {tabValue == 1 &&
                fields2.map((field, index) => (
                    <Stack key={field.id} >
                        <HalfDay control={form.control} day={field.day_of_week} isWorking={working2[index].is_working} name={`week2.${index}`} slot={field.slot_name} />
                    </Stack>

                ))}
        </form>
    )

}



interface HalfDayProps {
    isWorking: boolean
    control: Control<Schema, unknown, Schema>
    name: `week1.${number}` | `week2.${number}`
    slot: Workday["slot_name"]
    day: string
}
const HalfDay = ({ isWorking, slot, day, control, name }: HalfDayProps) => {
    return (
        <Box
            sx={{
                p: 2,
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                bgcolor: isWorking ? "#f1f8e9" : "#fafafa",
                borderColor: isWorking
                    ? "#4caf50"
                    : "#e0e0e0",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                {day}-
                {slot}----
                {isWorking ? "a" : "b"}
                <FormSwitch label={slot} control={control}
                    name={`${name}.is_working`} />

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
                    <FormTime label="Début" control={control}
                        name={`${name}.start_time`} />


                    <Typography variant="body2">-</Typography>
                    <FormTime label="fin" control={control}
                        name={`${name}.end_time`} />

                </Box>
            )}
        </Box>
    )
}