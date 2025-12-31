import { Grid, MenuItem } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormInput, FormSelect, FormSwitch, type BaseFormProps } from "./FormBase"

interface CollectionPointModel {
    name: string
    address: string
    city: string
    postal_code: string
    contact_person: string
    contact_phone: string
    contact_email: string
    type: string
    notes: string
    is_active: boolean
    recyclery_id: number | string
}

interface CollectionPointFormProps extends BaseFormProps<CollectionPointModel> {
    recycleries: Array<{ id: number; name: string }>
}

export const CollectionPointForm = ({ formId, onSubmit, defaultValues, recycleries }: CollectionPointFormProps) => {

    const form = useForm(
        {
            defaultValues: {
                name: defaultValues?.name || "",
                address: defaultValues?.address || "",
                city: defaultValues?.city || "",
                postal_code: defaultValues?.postal_code || "",
                contact_person: defaultValues?.contact_person || "",
                contact_phone: defaultValues?.contact_phone || "",
                contact_email: defaultValues?.contact_email || "",
                type: defaultValues?.type || "standard",
                notes: defaultValues?.notes || "",
                is_active: defaultValues?.is_active || true,
                recyclery_id: defaultValues?.recyclery_id || "",
            }
        }
    )
    return (<form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>

            <Grid size={{ xs: 12, md: 6 }}><FormInput control={form.control} label="Nom du point" name="name" /></Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect control={form.control} label="Type" name="type">
                    <MenuItem value="standard">Standard</MenuItem>
                    <MenuItem value="enterprise">Entreprise</MenuItem>
                    <MenuItem value="association">Association</MenuItem>
                    <MenuItem value="school">École</MenuItem>
                    <MenuItem value="hospital">Hôpital</MenuItem>
                    <MenuItem value="other">Autre</MenuItem>
                </FormSelect>
            </Grid>
            <Grid size={{ xs: 12 }}><FormInput control={form.control} label="Adresse" name="address" extra={{ multiline: true, rows: 2 }} /></Grid>
            <Grid size={{ xs: 12, md: 8 }}><FormInput control={form.control} label="Ville" name="city" /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><FormInput control={form.control} label="Code postal" name="postal_code" /></Grid>

            <Grid size={{ xs: 12, md: 6 }}><FormInput control={form.control} label="Personne de contact" name="contact_person" /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><FormInput control={form.control} label="Téléphone" name="contact_phone" /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><FormInput control={form.control} label="Email" name="contact_email" /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><FormSelect control={form.control} label="Recyclerie" name="recyclery_id" >
                <MenuItem value="">Aucune</MenuItem>
                {recycleries.map((recyclery) => (
                    <MenuItem key={recyclery.id} value={recyclery.id}>
                        {recyclery.name}
                    </MenuItem>
                ))}
            </FormSelect>
            </Grid>
            <Grid size={{ xs: 12 }}> <FormInput control={form.control} label="Notes" name="notes" extra={{ multiline: true, rows: 3 }} /></Grid>
            <Grid size={{ xs: 12 }}> <FormSwitch control={form.control} label="Point actif" name="is_active" /></Grid>

        </Grid>
    </form>

    )
}
