import { Add, Cancel, Edit, Loyalty, Save } from "@mui/icons-material"
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "react-toastify"
import type { CategoryModel, PromoModel } from "../../../interfaces/Models"
import { fetchCategories } from "../../../services/api/categories"
import { createPromo, listPromos, updatePromo } from "../../../services/api/promo"
import { PromoForm, type Schema } from "../../forms/PromoForm"
import { Loading } from "../../Loading"

export const PromoTab = () => {
    const [isModaleOpen, SetIsModaleOpen] = useState(false)
    const [currentPromo, setCurrentPromo] = useState<PromoModel | null>(null)
    const queryClient = useQueryClient()
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
        onSuccess: (data, variables) => {
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
        const categorie = promo.Category?.parent ?? promo.Category
        const subcategorie = promo.Category?.parent ? promo.Category : null
        setCurrentPromo({ ...promo, category_id: categorie?.id || promo.category_id, subcategory_id: subcategorie?.id })
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
                                sx={{ height: "100%", display: "flex", flexDirection: "column" }}
                            >
                                <CardContent sx={{ flexGrow: 1 }}>

                                    <Typography>{getPromoCategories(promo).categorie}</Typography>
                                    <Typography>{getPromoCategories(promo).subcategorie}</Typography>

                                    <Typography>debut :{new Date(promo.startDate).toLocaleDateString()}</Typography>
                                    <Typography>fin :{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : "jamais"}</Typography>
                                    <Typography>reduction {promo.promotionValue} %</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button startIcon={<Edit />} variant="contained" onClick={() => handleOpenDialog(promo)}>
                                        Edit
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
                    <PromoForm formId="PromoForm" onSubmit={savePromo} defaultValues={currentPromo} categories={categories.data || []} />

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