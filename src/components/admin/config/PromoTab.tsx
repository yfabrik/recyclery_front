import { Add, CalendarMonth, Cancel, Category, Edit, Loyalty, Percent, Save, Storefront, SubdirectoryArrowRight } from "@mui/icons-material"
import { Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "react-toastify"
import type { PromoModel } from "../../../interfaces/Models"
import { fetchCategories } from "../../../services/api/categories"
import { createPromo, listPromos, updatePromo } from "../../../services/api/promo"
import { fetchStores } from "../../../services/api/store"
import { PromoForm, type PromoFormValues, type Schema } from "../../forms/PromoForm"
import { Loading } from "../../Loading"
import type { PromotionDataInput } from "@recyclerie/api/schemas/promotions"
import { getApiErrorMessage, getApiSuccessMessage } from "../../../utils/apiToastMessage"

type PromoEditModel = PromoModel & { subcategory_id?: number | null };

function promoToFormValues(promo: PromoEditModel): Partial<PromoFormValues> {
    return {
        category_id: promo.category_id as PromoFormValues["category_id"],
        subcategory_id: promo.subcategory_id ?? "",
        promotionValue: promo.promotionValue,
        startDate: new Date(promo.startDate),
        endDate: promo.endDate ? new Date(promo.endDate) : "",
        isActive: promo.isActive,
        stores: promo.stores?.length ? promo.stores.map((store) => store.id) : [""],
    };
}

export const PromoTab = () => {
    const [isModaleOpen, SetIsModaleOpen] = useState(false)
    const [editingPromoId, setEditingPromoId] = useState<PromoModel["id"] | null>(null)
    const [formDefaults, setFormDefaults] = useState<Partial<PromoFormValues> | null>(null)

    const queryClient = useQueryClient()
    const stores = useQuery({
        queryKey: ["stores", { active: true }],
        queryFn: () => fetchStores({ active: true }).then(response => response.data.data),
    });
    
    const categories = useQuery({
        queryFn: () =>
            fetchCategories({ only_category: true, include: ["category"], sell: true }).then(
                (result) => result.data.data || [],
            ),
        queryKey: ["categorie", { only_category: true, include: "Category", sell: true }],
    });


    // const flatCategories = categories.data?.flatMap(cat => [cat, ...cat.subcategories])
    const promotions = useQuery({
        queryFn: () =>
            listPromos().then(
                (result) => result.data.data || [],
            ),
        queryKey: ["promotions"],
    });

    const createPromoPayloadFromForm = (data: Schema): PromotionDataInput => {
        const category_id = data.subcategory_id ?? data.category_id
        const result = { ...data, category_id }
        return result
    };
    const addPromo = useMutation({
        mutationFn: (data: Schema) => createPromo(createPromoPayloadFromForm(data)),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["promotions"] })
            toast.success(data.data.message)
            handleCloseDialog()
        },
        onError: () => {

        }
    })
    const editPromo = useMutation({
        mutationFn: (data: { id: PromoModel["id"], data: Schema }) => updatePromo(data.id, createPromoPayloadFromForm(data.data)),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["promotions"] })
            toast.success(getApiSuccessMessage(data, "Promotion mise à jour avec succès"))
            handleCloseDialog()
        },
        onError: (error) => {
            toast.error(getApiErrorMessage(error, "Erreur lors de la mise à jour de la promotion"))
        }
    })
    const savePromo = (data: Schema) => {
        if (editingPromoId)
            editPromo.mutate({ id: editingPromoId, data })
        else
            addPromo.mutate(data)
    }

    const handleOpenDialog = (promo: PromoModel) => {
        //TODO peut aller directement dans le mapper ?
        const category = promo.Category
        const subcategory_id = category?.parent_id ? category.id : null
        const editModel: PromoEditModel = {
            ...promo,
            category_id: category?.parent_id ?? promo.category_id,
            subcategory_id,
        }
        setEditingPromoId(promo.id)
        setFormDefaults(promoToFormValues(editModel))
        SetIsModaleOpen(true)
    }

    const handleOpenCreateDialog = () => {
        setEditingPromoId(null)
        setFormDefaults(null)
        SetIsModaleOpen(true)
    }

    const handleCloseDialog = () => {
        setEditingPromoId(null)
        setFormDefaults(null)
        SetIsModaleOpen(false)
    }

    const getPromoCategories = (promo: PromoModel): { categorie: string, subcategorie: string | null } => {
        const category = promo.Category
        if (!category) {
            return { categorie: "", subcategorie: null }
        }
        if (category.parent_id) {
            const parent = categories.data?.find((cat) => cat.id === category.parent_id)
            return {
                categorie: parent?.name || "",
                subcategorie: category.name || null,
            }
        }
        return {
            categorie: category.name || "",
            subcategorie: null,
        }
    }
    const getPromoStores = (promo: PromoModel): string => {
        if (!promo.stores || promo.stores.length === 0) return "tous les magasins"
        return promo.stores.map((store) => store.name).join(", ")
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    <Loyalty />{" "}
                    Gestion des Promotions
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreateDialog}
                >
                    nouvelle Promotion
                </Button>
            </Box>

            <Loading isLoading={promotions.isLoading}>
                <Grid container spacing={3}>
                    {promotions.data?.map((promo) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={promo.id}>
                            <Card
                                sx={{
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    borderRadius: 3,
                                    boxShadow: 3,
                                }}
                            >
                                <CardContent
                                    sx={{
                                        flexGrow: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1.5,
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                        <Category fontSize="small" color="primary" />
                                        <Box sx={{ ml: 1 }}>
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {getPromoCategories(promo).categorie}
                                            </Typography>
                                            {getPromoCategories(promo).subcategorie && (
                                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <SubdirectoryArrowRight
                                                        fontSize="inherit"
                                                        sx={{ mr: 0.5, opacity: 0.7 }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary">
                                                        {getPromoCategories(promo).subcategorie}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <CalendarMonth
                                                fontSize="small"
                                                sx={{ mr: 1, color: "text.secondary" }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                début : {new Date(promo.startDate).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            <CalendarMonth
                                                fontSize="small"
                                                sx={{ mr: 1, color: "text.secondary" }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                fin :{" "}
                                                {promo.endDate
                                                    ? new Date(promo.endDate).toLocaleDateString()
                                                    : "jamais"}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                                            <Storefront
                                                fontSize="small"
                                                sx={{ mr: 1, mt: 0.2, color: "text.secondary" }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                magasins : {getPromoStores(promo)}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            mt: 1.5,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 999,
                                            bgcolor: "success.light",
                                            color: "success.dark",
                                            width: "fit-content",
                                            columnGap: 0.5,
                                        }}
                                    >
                                        <Percent fontSize="small" />
                                        <Typography variant="body2" fontWeight={600}>
                                            Réduction {promo.promotionValue}%
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ mt: "auto", justifyContent: "flex-end", px: 2, pb: 2 }}>
                                    <Button
                                        startIcon={<Edit />}
                                        variant="contained"
                                        size="small"
                                        onClick={() => handleOpenDialog(promo)}
                                    >
                                        Modifier
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Loading>


            <Dialog
                open={isModaleOpen}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle>{editingPromoId ? "Modifier la promotion" : "Nouvelle Promotion"}</DialogTitle>
                <DialogContent>
                    <PromoForm
                        formId="PromoForm"
                        onSubmit={savePromo}
                        defaultValues={formDefaults ?? undefined}
                        categories={categories.data || []}
                        stores={stores.data || []}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        type="submit"
                        form="PromoForm"
                        loading={addPromo.isPending || editPromo.isPending}
                    >
                        Sauvegarder
                    </Button>
                </DialogActions>

            </Dialog>
        </Box>)
}