import { Avatar, Box, Card, CardContent, Checkbox, Chip, FormControlLabel, IconButton, Tooltip, Typography } from "@mui/material"
import type { CategoryModel } from "../interfaces/Models"
import { SelectedIcon } from "./SelectedIcon"
import { Add, Category, Delete, Edit } from "@mui/icons-material"
import { IO } from "../services/categoriesMask"
import type { UseMutationResult } from "@tanstack/react-query"
import type { AxiosResponse } from "axios"

interface CategoryCardProps {
    category: CategoryModel,
    isSubcategory?: boolean,
    handleOpenDialog: (c: CategoryModel | null, s?: CategoryModel["id"]) => void
    handleDelete: (c: CategoryModel) => void
    patchCategory: UseMutationResult<AxiosResponse<any, any, {}>, Error, {
        id: number;
        data: {
            in?: boolean;
            out?: boolean;
            sell?: boolean;
        };
    }, unknown>
}

export const CategoryCard = ({
    category,
    isSubcategory = false,
    handleOpenDialog,
    handleDelete,
    patchCategory
}: CategoryCardProps) => {
    return (
        <Card
            variant={isSubcategory ? "outlined" : "elevation"}
            sx={{
                mb: 1,
                ml: isSubcategory ? 3 : 0,
                backgroundColor: isSubcategory ? "grey.50" : "white",
            }}
        >
            <CardContent>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr minmax(180px, auto) minmax(120px, auto)",
                        alignItems: "center",
                        gap: 3,
                    }}
                >
                    <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}
                    >
                        <Avatar sx={{ bgcolor: isSubcategory ? "secondary.main" : "primary.main", width: 40, height: 40 }}>
                            {category.icon ? <SelectedIcon iconName={category.icon} /> : <Category />}
                        </Avatar>
                        <Box>
                            <Typography
                                variant={isSubcategory ? "subtitle1" : "h6"}
                                fontWeight="bold"
                            >
                                {category.name}
                            </Typography>
                            {category.description && (
                                <Typography variant="body2" color="text.secondary">
                                    {category.description}
                                </Typography>
                            )}
                            <Chip
                                label={
                                    isSubcategory ? "Sous-catégorie" : "Catégorie principale"
                                }
                                size="small"
                                color={isSubcategory ? "secondary" : "primary"}
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                            />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            flexWrap: "nowrap",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            minWidth: 0,
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!(category.IO & IO.IN)}
                                    name="in"
                                    onChange={(e) =>
                                        patchCategory.mutate({
                                            id: category.id,
                                            data: { in: e.target.checked },
                                        })
                                    }
                                />
                            }
                            labelPlacement="top"
                            label="Arrivage"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!(category.IO & IO.SELL)}
                                    name="sell"
                                    onChange={(e) =>
                                        patchCategory.mutate({
                                            id: category.id,
                                            data: { sell: e.target.checked },
                                        })
                                    }
                                />
                            }
                            labelPlacement="top"
                            label="Vente"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={!!(category.IO & IO.OUT)}
                                    name="out"
                                    onChange={(e) =>
                                        patchCategory.mutate({
                                            id: category.id,
                                            data: { out: e.target.checked },
                                        })
                                    }
                                />
                            }
                            labelPlacement="top"
                            label="Sortie"
                        />
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            minWidth: 0,
                            flexShrink: 0,
                            pl: 4,
                        }}
                    >
                        <Tooltip title="Modifier">
                            <IconButton
                                onClick={() => handleOpenDialog(category)}
                                color="primary"
                            >
                                <Edit />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                            <IconButton onClick={() => handleDelete(category)} color="error">
                                <Delete />
                            </IconButton>
                        </Tooltip>
                        {!isSubcategory && (
                            <Tooltip title="Ajouter une sous-catégorie">
                                <IconButton
                                    onClick={() => handleOpenDialog(null, category.id)}
                                    color="success"
                                >
                                    <Add />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}