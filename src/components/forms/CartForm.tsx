import { Alert, Box, Button, Chip, Divider, Grid, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { useFieldArray, useForm, useWatch, type Control } from "react-hook-form"
import type { BaseFormProps } from "./FormBase"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Add, Close, Payment, Remove, ShoppingCart } from "@mui/icons-material"
import { DevTool } from "@hookform/devtools"
import { idSchema } from "../../interfaces/ZodTypes"

const itemSchema = z.object({

    quantity: z.number(),
    price: z.number(),
    name: z.string(),
    category_name: z.string(),
    subcategory_name: z.string(),


    // id: idSchema(),
    barcode: z.string(),
    category_id: idSchema(),
    subcategory_id: idSchema().nullish(),
    description: z.string(),

    weight: z.number(),
    is_manual: z.boolean().default(false), // Flag pour identifier les articles manuels

})

const schema = z.object(
    { cart: z.array(itemSchema) }
)

export type Schema = z.infer<typeof schema>
export type CartItem = Schema["cart"][number];

export const CartForm = ({ formId, onSubmit }: BaseFormProps<Schema>) => {
    const form = useForm({
        defaultValues: {
            cart: []
        },
        resolver: zodResolver(schema)
    })

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "cart"
    });

    return (
        <>
            <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
                <Paper sx={{ p: 2 }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                    >
                        <ShoppingCart />
                        Panier ({fields.length} article{fields.length > 1 ? "s" : ""})
                    </Typography>

                    {fields.length === 0 ? (
                        <Alert severity="info">
                            Le panier est vide. Scannez des articles pour commencer.
                        </Alert>
                    ) : (

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Article</TableCell>
                                        <TableCell>Prix unitaire</TableCell>
                                        <TableCell>Quantité</TableCell>
                                        <TableCell>Total</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {fields.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                <Box>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {item.name}
                                                        </Typography>
                                                        {item.is_manual && (
                                                            <Chip
                                                                size="small"
                                                                label="Manuel"
                                                                color="info"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Box>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {item.barcode}
                                                    </Typography>
                                                    {(item.category_name || item.subcategory_name) && (
                                                        <Typography variant="body2" color="textSecondary">
                                                            {item.category_name}
                                                            {item.subcategory_name &&
                                                                ` > ${item.subcategory_name}`}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {item.price.toFixed(2)}€
                                            </TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                    }}
                                                >
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            //     {
                                                            //     console.log(item.quantity, form.getValues(`cart.${index}.quantity`))
                                                            //     form.setValue(`cart.${index}.quantity`, form.getValues(`cart.${index}.quantity`) - 1)

                                                            // }
                                                            (item.quantity - 1) <= 0 ? remove(index) :
                                                                update(index, { ...item, quantity: item.quantity - 1 })

                                                            // updateCartItemQuantity(
                                                            //     index,
                                                            //     item.quantity - 1,
                                                            // )
                                                        }}
                                                    >
                                                        <Remove />
                                                    </IconButton>
                                                    <Typography
                                                        sx={{ minWidth: 30, textAlign: "center" }}
                                                    >
                                                        {item.quantity}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => update(index, { ...item, quantity: item.quantity + 1 })
                                                            // updateCartItemQuantity(
                                                            //     index,
                                                            //     item.quantity + 1,
                                                            // )
                                                        }
                                                    >
                                                        <Add />
                                                    </IconButton>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight="bold">
                                                    {(item.price * item.quantity).toFixed(2)}€
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => remove(index)}
                                                >
                                                    <Close />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
                <DevTool control={form.control} />
                {/* <CartSum control={form.control} /> */}

            </form >
            <Button onClick={() => append({
                quantity: 1,
                price: 5,
                category_name: "a",
                subcategory_name: "b",
                name: "aaaaa",
                barcode: "abcdefgh",
                category_id: 1,
                description: "",
                is_manual: true,
                subcategory_id: 2,
                weight: 5, id: 1
            })}>add item </Button>

        </>
    )
}

const CartSum = (control: Control<Schema, unknown, Schema>) => {

    const sum = useWatch({
        control: control,
        name: "cart"
    })
    const total = sum.reduce((prev, current) => prev += (current.quantity * current.price), 0)
    return (
        <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 2, position: "sticky", top: 20 }}>
                <Typography variant="h6" gutterBottom>
                    Résumé de la Commande
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box
                    sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                    <Typography>Articles:</Typography>
                    <Typography>{sum.length}</Typography>
                </Box>

                <Box
                    sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
                >
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6" color="primary">
                        {total.toFixed(2)}€
                    </Typography>
                </Box>

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<Payment />}

                    disabled={sum.length === 0}
                    sx={{ mb: 2 }}
                >
                    Encaisser
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="textSecondary">
                    Session en cours
                </Typography>
                <Typography variant="body2">
                    Fonds de caisse:{" "}
                    {/* {parseFloat(activeSession.opening_amount).toFixed(2)}€ */}
                </Typography>
            </Paper>
        </Grid>
    )
}