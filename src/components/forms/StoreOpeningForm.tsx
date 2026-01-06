import { Grid, MenuItem } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormInput, FormSelect, FormSwitch, FormTime, type BaseFormProps } from "./FormBase"
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";
import { DAYS_OF_WEEK as daysOfWeek,TIME_SLOTS as timeSlotOptions  } from "../../interfaces/shared";



const schema = z.object({
    store_id: z.coerce.number(),
    day_of_week: z.string(),
    is_open: z.boolean(),
    open_time: z.string(),
    close_time: z.string(),
    is_24h: z.boolean(),
    notes: z.string()
});

type Schema = z.infer<typeof schema>

export const StoreOpeningForm = ({ formId, onSubmit, defaultValues, stores }: BaseFormProps<Schema> & { stores: Array<{ id: number, name: string }> }) => {
    const form = useForm(
        {
            resolver: zodResolver(schema),
            defaultValues: {
                store_id: defaultValues?.store_id || "",
                day_of_week: defaultValues?.day_of_week || "",
                is_open: defaultValues?.is_open || true,
                open_time: defaultValues?.open_time || "",
                close_time: defaultValues?.close_time || "",
                is_24h: defaultValues?.is_24h || false,
                notes: defaultValues?.notes || "",
            }
        }
    )

    const watchFields = form.watch(["is_open", "is_24h"])

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormSelect control={form.control} label="Magasin" name="store_id">
                        {stores.map(store => (
                            <MenuItem key={store.id} value={store.id}>
                                {store.name}
                            </MenuItem>
                        ))}
                    </FormSelect>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>

                    <FormSelect control={form.control} label="Jour de la semaine" name="day_of_week">
                        {daysOfWeek.map(day => (
                            <MenuItem key={day.key} value={day.label}>
                                {day.label}
                            </MenuItem>
                        ))}
                    </FormSelect>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormSwitch control={form.control} label="Magasin ouvert ce jour" name="is_open" />
                </Grid>

                {watchFields[0] && (
                    <>
                        <Grid size={{ xs: 12 }}>
                            <FormSwitch control={form.control} label="Ouvert 24h/24" name="is_24h" />
                        </Grid>

                        {!watchFields[1] && (
                            <>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormTime control={form.control} name="open_time" label="Heure d'ouverture"/>
                                    {/* <FormInput control={form.control} name="open_time" label="Heure d'ouverture" extra={{
                                        type: "time",
                                        slotProps: { inputLabel: { shrink: true } }
                                    }} /> */}

                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <FormTime control={form.control} name="close_time" label="Heure de fermeture"/>
                                    {/* <FormInput control={form.control} name="close_time" label="Heure de fermeture" extra={{
                                        type: "time",
                                        slotProps: { inputLabel: { shrink: true } }
                                    }} /> */}

                                </Grid>
                            </>
                        )}
                    </>
                )}

                <Grid size={{ xs: 12 }}>
                    <FormInput control={form.control} name="notes" label="Notes (optionnel)" extra={{
                        multiline: true,
                        rows: 3,
                        placeholder: "Ex: Pause déjeuner de 12h à 14h, fermeture exceptionnelle..."
                    }} />
                </Grid>
            </Grid>
        </form>
    )
}

