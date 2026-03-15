import { zodResolver } from "@hookform/resolvers/zod";
import { Add, Backpack, Close, Euro, Loyalty, Payment, QrCodeScanner, Remove, ShoppingCart } from "@mui/icons-material";
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, IconButton, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useFieldArray, useForm, type FieldArrayWithId, type UseFieldArrayRemove, type UseFieldArrayUpdate, type UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import type { CategoryModel } from "../../interfaces/Models";
import { getItemFromBarcode } from "../../services/api/labeledItems";
import {
    schema,
    type CartItem,
    type Schema
} from "./cartSchema";
import { FormInput, FormSelect } from "./FormBase";
import { ManualItemForm, type Schema as ManualItemSchema } from "./ManualItemForm";

const getCartLinePrice = (line: CartItem): number => {

    let bundles = 0
    let extraItems = line.quantity
    if (line.bundleQuantity && line.bundleQuantity !== 0) {
        bundles = Math.trunc(line.quantity / line.bundleQuantity)
        extraItems = line.quantity % line.bundleQuantity
    }
    const sum = (price: number, quantity: number) => price * quantity * (1 - line.promotion / 100)
    return (
        sum(line.price, extraItems) + sum(line.bundlePrice || line.price, bundles)
    )
}
const getCartTotal = (cart: CartItem[]) => {
    return cart.reduce(
        (prev, current) =>
        (prev +=
            getCartLinePrice(current)),
        0,
    );
};


interface CompoundCartFormProps {
    handleSale: (d: Schema) => void
    categories: CategoryModel[]
}
export const CompoundCartForm = ({ handleSale, categories }: CompoundCartFormProps) => {

    const form = useForm({
        defaultValues: {
            cart: [],
            payment_method: "cash",
            payment_amount: 0,
            customer_postal_code: "",
        },
        resolver: zodResolver(schema),
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: "cart",
    });

    const cart = form.watch("cart");



    const handleNewItem = (item: CartItem) => {
        const existingItem = cart.findIndex(
            (cartItem) => cartItem.barcode === item.barcode,
        );
        if (existingItem !== -1) {
            update(existingItem, {
                ...cart[existingItem],
                quantity: cart[existingItem].quantity + 1,
            });
        }
        else {
            append(item)
        }
    }

    return (
        <form id="cartForm" onSubmit={form.handleSubmit(handleSale)}>
            <Grid container spacing={2}>
                {/* Scanner et panier */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    {/* Scanner */}
                    <AddItem categories={categories} handleNewItem={handleNewItem} />

                    {/* Panier */}
                    <Cart fields={fields} remove={remove} update={update} />
                </Grid>

                {/* Résumé et paiement */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <CartSummary cart={cart} />

                    <Encaissement form={form} cart={cart} />
                </Grid>
            </Grid>
        </form>
    )
}
interface AddItemProps {
    handleNewItem: (item: CartItem) => void
    categories: CategoryModel[]
}
const AddItem = ({ handleNewItem, categories }: AddItemProps) => {
    const [scanInput, setScanInput] = useState("")
    const [manualItemDialog, setManualItemDialog] = useState(false)



    const handleScanProduct = async () => {
        if (!scanInput.trim()) {
            toast.error("Veuillez saisir un code-barres");
            return;
        }

        try {
            const response = await getItemFromBarcode(scanInput);
            const item = response.data.item;

            if (item.status !== "available") {
                toast.error("Cet article n'est pas disponible à la vente");
                return;
            }

            const category = categories.find(
                (cat) => cat.id === item.category_id,
            );
            const subCategory = categories.find(
                (cat) => cat.id === item.subcategory_id,
            );
            const source = subCategory ?? category;

            const category_name = category?.name ?? "";
            const subcategory_name = subCategory?.name ?? "";
            let itemName = category_name || "Article";
            if (subcategory_name) {
                itemName = `${category_name} (${subcategory_name})`;
            }

            handleNewItem({
                ...item,
                quantity: 1,
                name: itemName,
                category_name,
                subcategory_name,
                promotion: (category?.Promotions?.reduce((prev, current) => prev += current.promotionValue, 0) || 0) + (subCategory?.Promotions?.reduce((prev, current) => prev += current.promotionValue, 0) || 0),
                bundlePrice: source?.bundlePrice,
                bundleQuantity: source?.bundleQuantity
            });


            setScanInput("");
            toast.success(`${item.barcode} ajouté au panier`);
        } catch (error) {
            if (error.response?.status === 404) {
                toast.error("Article non trouvé");
            } else {
                toast.error("Erreur lors du scan");
            }
        }
    };

    const handleAddManualItem = (data: ManualItemSchema) => {
        // Générer un code-barres temporaire pour l'article manuel
        const tempBarcode = `MANUAL${Date.now()}`;
        ////// ce bloc c'est le meme que add item with barcode///////////
        const selectedCategory = categories.find(
            (cat) => cat.id == data.category_id,
        );
        const selectedSubcategory = selectedCategory?.subcategories?.find(
            (cat) => cat.id == data.subcategory_id,
        );

        // Générer un nom basé sur la catégorie et sous-catégorie
        let itemName = selectedCategory?.name || "Article";
        if (selectedSubcategory) {
            itemName = `${selectedSubcategory.name} (${selectedCategory?.name})`;
        }
        const source = selectedSubcategory ?? selectedCategory;
        if (source?.priceBasedOnWeight) data.price = data.price * data.weight;

        ////////////

        const manualItem = {
            // id: tempBarcode,
            barcode: tempBarcode,
            category_id: data.category_id,
            subcategory_id: data.subcategory_id,
            name: itemName,
            description: data.description || "",
            category_name: selectedCategory?.name || "",
            subcategory_name: selectedSubcategory?.name || "",
            price: data.price,
            weight: data.weight,
            quantity: 1,
            promotion: data.promotion,
            bundlePrice: source?.bundlePrice,
            bundleQuantity: source?.bundleQuantity
        } satisfies CartItem;

        handleNewItem(manualItem)

        setManualItemDialog(false);
        toast.success(`${itemName} ajouté au panier`);
    };



    return (
        <>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Ajouter Article
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                        fullWidth
                        placeholder="Scanner ou saisir le code-barres..."
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleScanProduct()}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <QrCodeScanner sx={{ mr: 1, color: "text.secondary" }} />
                                ),
                            },
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleScanProduct}
                        sx={{ minWidth: 100 }}
                        disabled={scanInput.length < 1}
                    >
                        Scanner
                    </Button>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => setManualItemDialog(true)}
                        sx={{ minWidth: 200 }}
                    >
                        Article Manuel
                    </Button>
                </Box>
            </Paper>
            <ManualItemDialog categories={categories} handleAddManualItem={handleAddManualItem} manualItemDialog={manualItemDialog} setManualItemDialog={setManualItemDialog} />
        </>

    )
}
interface ManualItemDialogProps {
    manualItemDialog: boolean,
    setManualItemDialog: React.Dispatch<React.SetStateAction<boolean>>,
    handleAddManualItem: (item: ManualItemSchema) => void
    categories: CategoryModel[]
}
const ManualItemDialog = ({ manualItemDialog, setManualItemDialog, handleAddManualItem, categories }: ManualItemDialogProps) => {
    return <Dialog
        open={manualItemDialog}
        onClose={() => setManualItemDialog(false)}
        maxWidth="md"
        fullWidth
    >
        <DialogTitle>Ajouter un Article Manuel</DialogTitle>
        <DialogContent>
            <ManualItemForm
                formId="manualItemForm"
                categories={categories || []}
                onSubmit={handleAddManualItem}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setManualItemDialog(false)}>Annuler</Button>
            <Button
                type="submit"
                form="manualItemForm"
                variant="contained"
            // disabled={!manualItemData.category_id || !manualItemData.price}
            >
                Ajouter au Panier
            </Button>
        </DialogActions>
    </Dialog>
}


interface CartProps {
    fields: FieldArrayWithId<Schema, "cart", "id">[], remove: UseFieldArrayRemove, update: UseFieldArrayUpdate<Schema, "cart">
}

const Cart = ({ fields, remove, update }: CartProps) => {
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
                                    <TableCell>
                                        {item.price.toFixed(2)}€
                                        {item.promotion != 0 && (
                                            <Chip
                                                color="secondary"
                                                icon={<Loyalty />}
                                                sx={{
                                                    marginLeft: 1,
                                                }}
                                                label={`-${item.promotion}%`}
                                                size="small"
                                            />
                                        )}
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
                                                    return item.quantity - 1 <= 0
                                                        ? remove(index)
                                                        : update(index, {
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
                                                    update(index, {
                                                        ...item,
                                                        quantity: item.quantity + 1,
                                                    })
                                                }
                                            >
                                                <Add />
                                            </IconButton>
                                            {item.bundleQuantity && item.bundleQuantity != 0 && item.bundleQuantity != 1 && item.quantity >= item.bundleQuantity &&
                                                <Chip
                                                    color="secondary"
                                                    icon={<Backpack />}
                                                    sx={{
                                                        marginLeft: 1,
                                                    }}
                                                    label={`${Math.trunc(item.quantity / item.bundleQuantity)} pack`}
                                                    size="small"
                                                />
                                            }
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight="bold">
                                            {getCartLinePrice(item).toFixed(2)}
                                            €
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
    )
}

interface CartSummaryProps {
    cart: CartItem[]
}
const CartSummary = ({ cart }: CartSummaryProps) => {
    return (
        <Paper sx={{ p: 2,/* position: "sticky",*/ top: 20 }}>
            <Typography variant="h6" gutterBottom>
                Résumé de la Commande
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
                <Typography>Types d'articles:</Typography>
                <Typography>{cart.length}</Typography>
            </Box>
            <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
                <Typography>Total d'articles:</Typography>
                <Typography>
                    {cart.reduce((prev, current) => (prev += current.quantity), 0)}
                </Typography>
            </Box>
            <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
                <Typography>Poids</Typography>
                <Typography>
                    {cart.reduce(
                        (prev, current) =>
                            (prev += current.weight * current.quantity),
                        0,
                    )}{" "}
                    Kg
                </Typography>
            </Box>

            <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                    {getCartTotal(cart).toFixed(2)}€
                </Typography>
            </Box>


        </Paper>
    )
}

interface EncaissementProps {
    form: UseFormReturn<Schema, unknown, Schema>
    cart: CartItem[]
}
const Encaissement = ({ form, cart }: EncaissementProps) => {
    const payment_amount = form.watch("payment_amount")
    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Grid container spacing={2} sx={{ mt: 1 }}>


                <Grid size={{ xs: 12 }}>
                    <FormSelect
                        label="Mode de paiement"
                        control={form.control}
                        name="payment_method"
                    >
                        <MenuItem value="cash">Espèces</MenuItem>
                        <MenuItem value="card">Carte bancaire</MenuItem>
                        <MenuItem value="check">Chèque</MenuItem>
                    </FormSelect>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormInput
                        label="Montant payé (€)"
                        control={form.control}
                        name="payment_amount"
                        extra={{
                            type: "number",
                            slotProps: {
                                input: {
                                    startAdornment: (
                                        <Euro sx={{ mr: 1, color: "text.secondary" }} />
                                    ),
                                },
                            },
                        }}
                    />
                </Grid>

                {+(payment_amount) > getCartTotal(cart) && (
                    <Grid size={{ xs: 12 }}>
                        <Alert severity="info">
                            Rendu à donner: {(+(payment_amount) - getCartTotal(cart)).toFixed(2)}€
                        </Alert>
                    </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormInput control={form.control} label="Code Postal" name="customer_postal_code" />

                </Grid>
                <Grid size={{ xs: 12 }}>

                </Grid>

            </Grid>
            <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Payment />}
                type="submit"
                form="cartForm"

                disabled={cart.length === 0}
                sx={{ mb: 2 }}
            >
                Encaisser
            </Button>
        </Paper>
    )
}