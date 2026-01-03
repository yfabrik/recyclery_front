import { Grid } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormInput, FormSwitch, type BaseFormProps } from "./FormBase";

interface EcoOrganismModel {
    id: number;
    name: string;
    description: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    website: string;
    is_active: boolean;
}


export const EcoOrganismForm = ({ formId, onSubmit }: BaseFormProps<EcoOrganismModel>) => {
    const form = useForm<EcoOrganismModel>()
    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12 }}>
                    <FormInput control={form.control} label="Nom *" name="name" />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormInput control={form.control} label="Description" name="description" extra={{ multiline: true, rows: 3 }} />

                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormInput control={form.control} label="Email de contact" name="contact_email" />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                    <FormInput control={form.control} label="Téléphone" name="contact_phone" />


                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormInput control={form.control} label="Adresse" name="address" extra={{ multiline: true, rows: 2 }} />


                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormInput control={form.control} label="Site Web" name="website" />


                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormSwitch control={form.control} label="Éco-organisme actif" name="is_active" />
                </Grid>
            </Grid>
        </form>
    )
}