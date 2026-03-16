import { Add, QrCodeScanner } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import { getItemFromBarcode } from "../services/api/labeledItems";
import type { CartItem } from "./forms/cartSchema";
import {
    ManualItemForm,
    type Schema as ManualItemSchema,
} from "../components/forms/ManualItemForm";
import type { CategoryModel, LabeledItemModel } from "../interfaces/Models";

interface AddItemsToCartProps {
    categories: CategoryModel[]
    handleAddToCart: (item: CartItem) => void
    append: (item: CartItem) => void
    update: (item: CartItem) => void

}
export const AddItemsToCart = ({ handleAddToCart, categories }: AddItemsToCartProps) => {
    const [scanInput, setScanInput] = useState("");
    const [manualItemDialog, setManualItemDialog] = useState(false);


    const formatItem = (item: LabeledItemModel): CartItem => {
        const category = categories.find(
            (cat) => cat.id === item.category_id,
        );
        const subCategory = category?.subcategories?.find(
            (cat) => cat.id === item.subcategory_id,
        );
        const source = subCategory ?? category;

        const category_name = category?.name ?? "";
        const subcategory_name = subCategory?.name ?? "";
        let itemName = category_name || "Article";
        if (subcategory_name) {
            itemName = `${category_name} (${subcategory_name})`;
        }
        return {
            ...item,
            quantity: 1,
            name: itemName,
            category_name,
            subcategory_name,
            promotion: (category?.Promotions?.reduce((prev, current) => prev += current.promotionValue, 0) || 0) + (subCategory?.Promotions?.reduce((prev, current) => prev += current.promotionValue, 0) || 0),
            bundlePrice: source?.bundlePrice,
            bundleQuantity: source?.bundleQuantity
        }
    }
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

            const cartItem = formatItem(item)
            // Ajouter au panier
            handleAddToCart(cartItem)


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

            // total_price: parseFloat(data.price),
            // is_manual: true, // Flag pour identifier les articles manuels
        } satisfies CartItem;


        handleAddToCart(manualItem);
        // setCart((prev) => [...prev, manualItem]);

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

            <Dialog
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
        </>

    )
}