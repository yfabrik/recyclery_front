import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Card, CardContent, Checkbox, Chip, FormControlLabel, Grid, Radio, RadioGroup, Typography } from "@mui/material";
import { Controller, useFieldArray, useForm, useWatch, type Control, type UseFormReturn } from "react-hook-form";
import z from "zod";
import { idSchema } from "../../interfaces/ZodTypes";
import type { BaseFormProps } from "./FormBase";
import type { StoreModel } from "../../interfaces/Models";
import { Star, Store } from "@mui/icons-material";
import { DevTool } from "@hookform/devtools";
import { useEffect } from "react";

const storeSchema = z.object({
    store_id: idSchema(),
    isAssigned: z.boolean(),
    name: z.string()
})
const schema = z.object({ stores: z.array(storeSchema), isPrimary: z.string() })

export type Schema = z.infer<typeof schema>

export const EmployeeStoresForm = ({ formId, onSubmit, defaultValues, stores, assignments }: BaseFormProps<Schema> & {
    stores: StoreModel[], assignments?: (StoreModel & {
        is_primary: boolean;
        EmployeeStore: {
            is_primary: boolean;
        }
    })[]
}) => {
    const assignedStore = stores.map(store => {
        const ass = assignments?.find(a => a.id == store.id)
        if (ass) {
            ass.isAssigned = true
            return ass
        }
        return store
    })

    console.log(assignedStore)

    const form = useForm({
        defaultValues: {
            stores: assignedStore.map(store => ({ ...store, store_id: store.id })),
            isPrimary: assignedStore.find(store => store?.is_primary)?.name ?? ""
        },
        resolver: zodResolver(schema),
    })

    const { fields, } = useFieldArray({
        name: "stores",
        control: form.control,
    });

    const primary = form.watch("isPrimary")

    return (
        <>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
                <Grid container spacing={2}>
                    <RadioGroup row>
                        {fields.map((field, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={field.id}>
                                <Card
                                    sx={{
                                        border: field.isAssigned
                                            ? "2px solid #4caf50"
                                            : "1px solid #e0e0e0",
                                        bgcolor: field.isAssigned ? "#f1f8e9" : "white",
                                        "&:hover": {
                                            boxShadow: 2,
                                            transform: "translateY(-1px)",
                                        },
                                        width: "100%",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                                            <Store sx={{ mr: 1, color: "primary.main" }} />
                                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                                {field.name || "name"}
                                            </Typography>
                                            {primary == field.name && (
                                                <Chip
                                                    icon={<Star />}
                                                    label="Principal"
                                                    color="warning"
                                                    size="small"
                                                />
                                            )}
                                        </Box>

                                        {/* {store.address && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 1 }}
                                    >
                                        📍 {store.address}
                                    </Typography>
                                )} */}

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Controller
                                                name={`stores.${index}.isAssigned`}
                                                control={form.control}
                                                render={({ field: f }) => (
                                                    <FormControlLabel
                                                        {...f}
                                                        control={
                                                            <Checkbox
                                                                // value={f.value}
                                                                checked={f.value}
                                                                color="primary"
                                                            />
                                                        }
                                                        label="Affecté"
                                                    />
                                                )}
                                            />

                                            <Primary control={form.control} name={`stores.${index}`} value={field.name} primary={primary} />


                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </RadioGroup>
                </Grid>

            </form>
            <DevTool control={form.control} />

        </>

    )
}


const Primary = ({
    control,
    name,
    value,
    primary
}: {
    control: Control<Schema, unknown, Schema>;
    name: `stores.${number}`;
    value: string
    primary: string
}) => {
    const isAssigned = useWatch({
        control,
        name: `${name}.isAssigned`,
        defaultValue: false,
    });

    if (!isAssigned) return null;

    return (
        <Controller
            name="isPrimary"
            control={control}
            render={({ field }) => (
                <FormControlLabel {...field} value={value} control={<Radio color="warning" checked={value == primary} />} label="Principal" />

            )}
        />
    );
};