import { Grid, MenuItem } from "@mui/material"
import { useForm } from "react-hook-form"
import { FormInput, FormSelect, FormSwitch, type BaseFormProps } from "./FormBase"
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";



const schema = z.object({
    name: z.string().nonempty(),
    manager_id: z.coerce.number().optional(),
    address: z.string(),
    city: z.string(),
    postal_code: z.string(),
    phone: z.string(),
    email: z.string(),
    is_active: z.boolean(),
});

type Schema = z.infer<typeof schema>
interface StoreModel {

    employees: Array<number>
    // manager?: number
    manager_id: string
    caisses: []
    name: string
    address: string
    phone: string
    email: string
    city: string
    postal_code: string
    is_active: boolean

}
export const StoreForm = ({ formId, onSubmit, users, defaultValues }: BaseFormProps<Schema> & { users: Array<{ id: number, username: string, role: string }> }) => {
    const form = useForm(
        {
            resolver: zodResolver(schema),
            defaultValues: {
                name: defaultValues?.name || "",
                manager_id: defaultValues?.manager_id || "",
                address: defaultValues?.address || "",
                city: defaultValues?.city || "",
                postal_code: defaultValues?.postal_code || "",
                phone: defaultValues?.phone || "",
                email: defaultValues?.email || "",
                is_active: defaultValues?.is_active || true
            }

        }
    )


    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={{ xs: 12, md: 6 }} >
                    <FormInput label="Nom du magasin" control={form.control} name="name" />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} >
                    <FormSelect control={form.control} label="Manager" name="manager_id">
                        <MenuItem value="">Aucun</MenuItem>
                        {users.map(user => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.username} ({user.role})
                            </MenuItem>
                        ))}
                    </FormSelect>
                </Grid>

                <Grid size={{ xs: 12 }} >
                    <FormInput label="Adresse" name="address" control={form.control} />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
                    <FormInput control={form.control} label="Ville" name="city" />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
                    <FormInput control={form.control} label="Code postal" name="postal_code" />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
                    <FormInput control={form.control} label="Téléphone" name="phone" />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
                    <FormInput control={form.control} label="Email" name="email" />

                </Grid>

                <Grid size={{ xs: 12, md: 6 }} >
                    <FormSwitch control={form.control} label="Active ?" name="is_active" />

                </Grid>
            </Grid>
        </form>
    )
}