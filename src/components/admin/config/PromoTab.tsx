import { Add, Cancel, Category, CalendarMonth, Edit, Loyalty, Percent, Save, Storefront, SubdirectoryArrowRight } from "@mui/icons-material"
import { Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "react-toastify"
import type { PromoModel, StoreModel } from "../../../interfaces/Models"
import { fetchCategories } from "../../../services/api/categories"
import { createPromo, listPromos, updatePromo } from "../../../services/api/promo"
import { PromoForm, type Schema } from "../../forms/PromoForm"
import { Loading } from "../../Loading"
import { fetchStores } from "../../../services/api/store"

export const PromoTab = () => {
    const [isModaleOpen, SetIsModaleOpen] = useState(false)
    // PromoModel does not include `subcategory_id`, but PromoForm needs it to keep the
    // user's subcategory selection when editing an existing promotion.
    const [currentPromo, setCurrentPromo] = useState<(PromoModel & { subcategory_id?: number | null }) | null>(null)
    const queryClient = useQueryClient()
    const stores = useQuery({
        queryKey: ["stores", { active: true }],
        queryFn: () => fetchStores({ active: true }).then(response => response.data.stores),
    });
    const categories = useQuery({
        queryFn: () =>
            fetchCategories({ only_category: true, include: "category", sell: true }).then(
                (result) => result.data.categories || [],
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

    const addPromo = useMutation({
        mutationFn: (data: Schema) => createPromo(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["promotions"] })
            toast.success(data.data.message)
            handleCloseDialog()
        },
        onError: () => {

        }
    })
    const editPromo = useMutation({
        mutationFn: (data: { id: number, data: Schema }) => updatePromo(data.id, data.data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["promotions"] })
            toast.success(data.data.message)
            handleCloseDialog()
        },
        onError: () => {

        }

    })
    const savePromo = (data: Schema) => {
        const category = data.subcategory_id ?? data.category_id
        const result = { ...data, category_id: category }
        if (currentPromo?.id)
            editPromo.mutate({ id: currentPromo.id, data: result })
        else
            addPromo.mutate(result)
    }

    const handleOpenDialog = (promo: PromoModel) => {
        const parentCategory = promo.Category?.parent ?? promo.Category
        // If promo.Category has a parent, then promo.Category itself is a subcategory.
        const subcategory_id = promo.Category?.parent ? promo.Category.id : null
        setCurrentPromo({
            ...promo,
            category_id: parentCategory?.id || promo.category_id,
            subcategory_id,
        } as PromoModel & { subcategory_id?: number | null } | null)
        SetIsModaleOpen(true)
    }

    const handleCloseDialog = () => {
        setCurrentPromo(null)
        SetIsModaleOpen(false)
    }

    const getPromoCategories = (promo: PromoModel): { categorie: string, subcategorie: string | null } => {
        const categorie = promo.Category?.parent ?? promo.Category
        const subcategorie = promo.Category?.parent ? promo.Category : null
        return {
            categorie: categorie?.name || "",
            subcategorie: subcategorie?.name || null
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
                    onClick={() => SetIsModaleOpen(true)}
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
                <DialogTitle>{currentPromo ? "Modifier la promotion" : "Nouvelle Promotion"}</DialogTitle>
                <DialogContent>
                    <PromoForm
                        formId="PromoForm"
                        onSubmit={savePromo}
                        defaultValues={
                            currentPromo
                                ? {
                                    ...currentPromo,
                                    startDate: new Date(currentPromo.startDate),
                                    endDate: currentPromo.endDate
                                        ? new Date(currentPromo.endDate)
                                        : null,
                                    stores: currentPromo.stores?.map((store: StoreModel) => store.id) ?? []
                                }
                                : undefined
                        }
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