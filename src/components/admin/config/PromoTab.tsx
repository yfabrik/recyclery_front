import { Add, Cancel, Edit, Loyalty, Save } from "@mui/icons-material"
import { Box, Button, Card, CardActions, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "react-toastify"
import type { PromoModel } from "../../../interfaces/Models"
import { fetchCategories } from "../../../services/api/categories"
import { createPromo, listPromos, updatePromo } from "../../../services/api/promo"
import { PromoForm, type Schema } from "../../forms/PromoForm"

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

    const flatCategories = categories.data?.flatMap(cat => [cat, ...cat.subcategories])
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
        if (currentPromo?.id)
            editPromo.mutate({ id: currentPromo.id, data })
        else
            addPromo.mutate(data)
    }

    const handleOpenDialog = (promo: PromoModel) => {
        setCurrentPromo(promo)
        SetIsModaleOpen(true)
    }

    const handleCloseDialog = () => {
        setCurrentPromo(null)
        SetIsModaleOpen(false)
    }
    if (promotions.isLoading)
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        );


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

            <Grid container spacing={3}>
                {promotions.data?.map((promo) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={promo.id}>
                        <Card
                            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography>{categories.data?.find(cat => cat.id == promo.category_id)?.name || "-"}</Typography>
                                <Typography>{categories.data?.find(cat => cat.id == promo.subcategory_id)?.name || "-"}</Typography>
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