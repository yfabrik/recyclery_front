import { useForm } from "react-hook-form";
import { FormInput, FormSelect, FormSwitch, type BaseFormProps } from "./FormBase";
import { Grid, MenuItem } from "@mui/material";
import * as z from "zod";



import { DAYS_OF_WEEK as daysOfWeek, TIME_SLOTS as timeSlotOptions } from "../../interfaces/shared";
import type { PointPresenceModel } from "../../interfaces/Models";


// export const timeSlotOptions = [
//     { value: "Matin", label: "Matin" },
//     { value: "Après-midi", label: "Après-midi" },
//     { value: "Soir", label: "Soir" },
// ];
const schema = z.object({
    day_of_week: z.string(),
    time_slot_name: z.string(),
    is_present: z.boolean(),
    start_time: z.string(),
    end_time: z.string(),
    is_24h: z.boolean(),
    notes: z.string(),
    collection_point_id: z.number(),
    store_id: z.number()
})

type Schema = z.infer<typeof schema>

export const PresencePointForm = ({ formId, onSubmit, collectionPoints, stores }: BaseFormProps<PointPresenceModel> & { collectionPoints: Array<{ id: number, name: string }> } & { stores: Array<{ id: number, name: string }> }) => {

    const form = useForm<PointPresenceModel>()
    const is_24 = form.watch("is_24h")
    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect control={form.control} label="Point de collecte" name="collection_point_id">

                        {collectionPoints.map((point) => (
                            <MenuItem key={point.id} value={point.id}>
                                {point.name}
                            </MenuItem>
                        ))}
                    </FormSelect>

                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect control={form.control} label="Magasin assigné" name="store_id">
                        <MenuItem value="">
                            <em>Aucun magasin assigné</em>
                        </MenuItem>
                        {stores.map((store) => (
                            <MenuItem key={store.id} value={store.id}>
                                {store.name}
                            </MenuItem>
                        ))}
                    </FormSelect>

                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect label="Jour de la semaine" control={form.control} name="day_of_week">
                        {daysOfWeek.map((day) => (
                            <MenuItem key={day.key} value={day.label}>
                                {day.label}
                            </MenuItem>
                        ))}
                    </FormSelect>

                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect control={form.control} label="Crénau" name="time_slot_name">
                        {timeSlotOptions.map((slot) => (
                            <MenuItem key={slot.value} value={slot.value}>
                                {slot.label}
                            </MenuItem>
                        ))}
                    </FormSelect>

                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSwitch control={form.control} label="Présent ce jour" name="is_present" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    {/* //TODO FIXME  j'aime pas le type time*/}
                    <FormInput control={form.control} label="Heure de début" name="start_time" extra={{ type: 'time', slotProps: { inputLabel: { shrink: true } }, disabled: is_24 }}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormInput control={form.control} label="Heure de fin" name="end_time" extra={{ type: 'time', slotProps: { inputLabel: { shrink: true } }, disabled: is_24 }}
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormSwitch control={form.control} name="is_24h" label="Présent 24h/24" />

                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormInput control={form.control} label="Notes" name="notes" extra={{ placeholder: "Instructions spéciales, détails importants...", multiline: true, rows: 3 }} />

                </Grid>
            </Grid>
        </form>
    )
}