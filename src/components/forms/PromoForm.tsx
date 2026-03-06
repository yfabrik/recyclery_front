import { useForm, useWatch } from "react-hook-form"
import { FormDate, FormInput, FormSelect, FormSwitch, type BaseFormProps } from "./FormBase"
import z from "zod"
import { idSchema, nullString } from "../../interfaces/ZodTypes"
import { emptyStringToNull } from "../../services/zodTransform"
import { zodResolver } from "@hookform/resolvers/zod"
import { Grid, MenuItem } from "@mui/material"
import type { CategoryModel } from "../../interfaces/Models"

const schema = z.object({
    category_id: idSchema("categorie requis"),
    subcategory_id: z.union([idSchema(), z.literal("").transform(() => null)]),
    promotionValue: z.coerce.number("valeur doit etre en 0 et 100").min(0).max(100),
    startDate: z.coerce.date(),
    endDate: z.union([z.coerce.date(), nullString()]),
    isActive: z.boolean()
})
export type Schema = z.infer<typeof schema>


export const PromoForm = ({
    formId,
    onSubmit,
    defaultValues,
    categories
}: BaseFormProps<Schema> & {
    categories: CategoryModel[]
}) => {
    const data = defaultValues ? emptyStringToNull(defaultValues) : {}

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            category_id: "",
            subcategory_id: "",
            promotionValue: "",
            isActive: true,
            ...data
        }
    })
    const SubCategories = ({ control }: { control: typeof form.control }) => {
        const category = useWatch({
            control: control,
            name: "category_id",
        });
        const subcats =
            categories.find((c) => c.id == category)?.subcategories ?? [];
        return (
            <FormSelect
                control={control}
                name="subcategory_id"
                label="Sous-catégorie"
                extra={{ disabled: subcats.length < 1 }}
            >
                <MenuItem value="">Aucune</MenuItem>
                {subcats.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                        {category.name}
                    </MenuItem>
                ))}
            </FormSelect>
        );
    };


    return <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                    control={form.control}
                    name="category_id"
                    label="Catégorie"
                >
                    {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                            {category.name}
                        </MenuItem>
                    ))}
                </FormSelect>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <SubCategories control={form.control} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <FormDate control={form.control} label="date de debut" name="startDate"></FormDate>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <FormDate control={form.control} label="date de fin" name="endDate"></FormDate>

            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <FormInput control={form.control} label="promotion (%)" name="promotionValue" />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
                <FormSwitch control={form.control} name="isActive" label="promo active" />
            </Grid>
        </Grid>
    </form>
}