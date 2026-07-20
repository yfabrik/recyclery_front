import { zodResolver } from "@hookform/resolvers/zod"
import { Grid, MenuItem } from "@mui/material"
import { useEffect, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
import z from "zod"
import type { CategoryModel, StoreModel } from "../../interfaces/Models"
import { idSchema, nullString } from "../../interfaces/ZodTypes"
import { FormCategorySubcategoryFields, FormDate, FormInput, FormMultiSelect, FormSwitch, type BaseFormProps } from "./FormBase"

const schema = z.object({
    category_id: idSchema("categorie requis"),
    subcategory_id: z.union([nullString(),idSchema()]),
    promotionValue: z.coerce.number("valeur doit etre en 0 et 100").min(0).max(100),
    startDate: z.coerce.date(),
    endDate: z.union([nullString(),z.coerce.date()]),
    isActive: z.boolean(),
    stores: z
        .array(z.union([z.literal(""),idSchema()]))//TODO remake cleaner
        .transform((value) => {
            if (value.length === 1 && value[0] === "") return null
            return value.filter((store): store is number => typeof store === "number")
        })
})
export type Schema = z.infer<typeof schema>
export type PromoFormValues = z.input<typeof schema>


export const PromoForm = ({
    formId,
    onSubmit,
    defaultValues,
    categories,
    stores
}: BaseFormProps<PromoFormValues,Schema> & {
    categories: CategoryModel[],
    stores: StoreModel[]
}) => {
    const { stores: defaultStores, ...otherDefaultValues } = defaultValues ?? {}
    const normalizedDefaults = {
        ...otherDefaultValues,
        stores:
            defaultStores === null || (Array.isArray(defaultStores) && defaultStores.length === 0)
                ? [""]
                : defaultStores ?? [""],
    } satisfies Partial<PromoFormValues>

    const form = useForm<PromoFormValues, unknown, Schema>({
        resolver: zodResolver(schema),
        defaultValues: {
            category_id: "",
            subcategory_id: "",
            promotionValue: "",
            isActive: true,
            ...normalizedDefaults,
        }
    })
    const selectedStores = useWatch({
        control: form.control,
        name: "stores",
    })
    const previousStores = useRef<(number | string)[]>([])

    useEffect(() => {
        const currentStores = Array.isArray(selectedStores)
            ? selectedStores.filter((store): store is string | number => typeof store === "string" || typeof store === "number")
            : []

        if (currentStores.length === 0) {
            const nextStores = [""]
            form.setValue("stores", nextStores, { shouldDirty: true, shouldValidate: true })
            previousStores.current = nextStores
            return
        }

        const hadAllStores = previousStores.current.includes("")
        const hasAllStores = currentStores.includes("")

        if (hasAllStores && !hadAllStores) {
            if (currentStores.length !== 1) {
                const nextStores = [""]
                form.setValue("stores", nextStores, { shouldDirty: true, shouldValidate: true })
                previousStores.current = nextStores
                return
            }
        } else if (hasAllStores && currentStores.length > 1) {
            const nextStores = currentStores.filter((store) => store !== "")
            form.setValue("stores", nextStores, { shouldDirty: true, shouldValidate: true })
            previousStores.current = nextStores
            return
        }

        previousStores.current = currentStores
    }, [form, selectedStores])

    return <form id={formId} onSubmit={form.handleSubmit(onSubmit, (e) => console.error(e))}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <FormCategorySubcategoryFields
                control={form.control}
                categories={categories}
                setValue={form.setValue}
                hideWhenEmpty={false}
            />
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
            <Grid size={{ xs: 12, sm: 6 }}>
                <FormMultiSelect control={form.control} name="stores" label="Magasins" >
                    <MenuItem key="no-store" value="">tous les magasins</MenuItem>
                    {stores.map((store) => (
                        <MenuItem key={`${store.id}`} value={store.id}>

                            {store.name}
                        </MenuItem>
                    ))}
                </FormMultiSelect>

            </Grid>
        </Grid>
    </form>
}