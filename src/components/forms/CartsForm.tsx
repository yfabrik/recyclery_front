import { Add, Close, Remove, ShoppingCart } from "@mui/icons-material"
import { Alert, Box, Button, Chip, IconButton, Paper, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from "@mui/material"
import { useState } from "react"
import { useFieldArray, type UseFormReturn } from "react-hook-form"
import z from "zod"
import { idSchema } from "../../interfaces/ZodTypes"


const cartItem = z.object({
    quantity: z.number().nonnegative(),
    price: z.number().nonnegative(),
    name: z.string(),
    category_name: z.string(),
    subcategory_name: z.string(),
    barcode: z.string(),
    category_id: idSchema(),
    subcategory_id: idSchema().nullish(),
    description: z.string(),
    weight: z.number(),
})

const cartSchema = z.object({
    cart: z.array(cartItem)
})


export const cartsSchema = z.object({
    carts: z.array(cartSchema)
})

type CartItem = z.infer<typeof cartItem>
type CartSchema = z.infer<typeof cartSchema>
export type CartsSchema = z.infer<typeof cartsSchema>


interface CartsFormProps {
    form: UseFormReturn<CartsSchema, unknown, CartsSchema>
}
//FIXME faut que je fasse remonter le append du cart actuel
//FIXME il faut que je delete le selected cart quand on fait une vente(+ le recreer si lenght =1)
/**
 * @deprecated
 * @param param0 
 * @returns 
 */
export const CartsForm = ({ form }: CartsFormProps) => {
    const [tabValue, setTabValue] = useState(0)
    const carts = useFieldArray({
        control: form.control,
        name: `carts`
    })
    const addCart = () => {
        carts.append({ cart: [] })
    }
    const removeCart = (i: number) => {
        //FIXME le remove marche pas quand on veut supprimer le selectionné, si y'a des data apres ça remove le suivant
        // if (carts.fields.length > 1)
        if (carts.fields.length == 1) {
            carts.replace({ cart: [] })
        }
        else {
            carts.remove(i)
        }
    }

    return (
        <>
            <Box sx={{ display: "flex" }}>
                <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
                    {carts.fields.map((field, index) => (
                        <Tab key={field.id} label={<Box>
                            Panier {index + 1}
                            <IconButton onClick={() => removeCart(index)} >
                                <Close />
                            </IconButton>
                        </Box>
                        } />
                    ))}

                </Tabs>
                <Button onClick={addCart}>+ Panier</Button>
            </Box>
            {carts.fields.map((field, index) => (
                tabValue === index &&
                <Cart form={form} index={index} />
            ))}
        </>

    )

}

interface CartProps extends CartsFormProps {
    index: number
}
const Cart = ({ form, index }: CartProps) => {

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: `carts.${index}.cart`
    })

    return (
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
                                <TableCell>Poids unitaire</TableCell>
                                <TableCell>Prix unitaire</TableCell>
                                <TableCell>Quantité</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fields.map((item, j) => (
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
                                                {isNaN(+item.barcode) && (
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
                                            {(item.category_name ||
                                                item.subcategory_name) && (
                                                    <Typography
                                                        variant="body2"
                                                        color="textSecondary"
                                                    >
                                                        {item.category_name}
                                                        {item.subcategory_name &&
                                                            ` > ${item.subcategory_name}`}
                                                    </Typography>
                                                )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{item.weight.toFixed(2)}Kg</TableCell>
                                    <TableCell>{item.price.toFixed(2)}€</TableCell>
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
                                                    return item.quantity - 1 <= 0
                                                        ? remove(j)
                                                        : update(j, {
                                                            ...item,
                                                            quantity: item.quantity - 1,
                                                        });
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
                                                onClick={() =>
                                                    update(j, {
                                                        ...item,
                                                        quantity: item.quantity + 1,
                                                    })
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
                                            onClick={() => remove(j)}
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
    )
}