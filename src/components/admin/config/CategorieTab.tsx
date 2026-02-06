import {
  Add,
  AdminPanelSettings,
  Cancel,
  Category,
  Delete,
  Edit,
  Inventory,
  Palette,
  Save,
  Settings,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import type { CategoryModel } from "../../../interfaces/Models";
import {
  createCategory,
  deleteCategory,
  fetchCategories as fCat,
  fetchCategoryIcons,
  updateCategory,
} from "../../../services/api/categories";
import { CategorieForm, type Schema } from "../../forms/CategorieForm";

export const CategoriesTab = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<
    Partial<CategoryModel> | null
  >(null);

  const queryClient = useQueryClient()

  const availableIcons = useQuery<{ name: string; label: string }[]>({
    queryFn: () => fetchCategoryIcons().then(result => result.data.icons).then(result => result.map((icon: string) => ({
      name: icon,
      label: icon,
    }))),
    placeholderData: [],
    queryKey: ["icons",]
  })

  const categories = useQuery({
    queryFn: () => fCat({ only_category: true, include: "category" }).then(result => result.data.categories || []),
    queryKey: ["categorie", { only_category: true, include: "Category" }]
  })
  if (categories.error) toast.error("Erreur lors du chargement des catégories");

  const updateCategorie = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Schema }) => updateCategory(id, data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      toast.success("Catégorie mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["categorie", { only_category: true, include: "Category" }] })
      handleCloseDialog()
    }
  })
  const createCategorie = useMutation({
    mutationFn: (data: Schema) => createCategory(data),
    onError: () => toast.error("Erreur lors de la sauvegarde"),
    onSuccess: () => {
      toast.success("Catégorie créée avec succès");
      queryClient.invalidateQueries({ queryKey: ["categorie", { only_category: true, include: "Category" }] })
      handleCloseDialog()
    }
  })

  const deleteCategorie = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onError: () => toast.error("Erreur lors de la suppression"),
    onSuccess: () => {
      toast.success("Catégorie supprimée avec succès")
      queryClient.invalidateQueries({ queryKey: ["categorie", { only_category: true, include: "Category" }] })
    }
  })

  const handleOpenDialog = (
    category: CategoryModel | null = null,
    parent_id: number | null = null,
  ) => {
    if (category) {
      setEditingCategory(category);
    } else {
      setEditingCategory(parent_id ? { parent_id: parent_id } : null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
  };

  const handleSave = async (formData: Schema) => {
    if (editingCategory?.id) updateCategorie.mutate({ id: editingCategory.id, data: formData })
    else createCategorie.mutate(formData)
  };

  const handleDelete = async (category: CategoryModel) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)
    ) {
      deleteCategorie.mutate(category.id)
    }
  };

  const getIconComponent = (iconName: string): ReactNode => {
    // Import dynamique des icônes Material-UI
    const iconMap = {
      Category: Category,
      Inventory: Inventory,
      Settings: Settings,
      Palette: Palette,
      AdminPanelSettings: AdminPanelSettings,
    };

    const IconComponent = iconMap[iconName] || Category;
    return <IconComponent />;
  };

  const renderCategoryCard = (
    category: CategoryModel,
    isSubcategory = false,
  ) => (
    <Card
      key={category.id}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
              {category.icon ? getIconComponent(category.icon) : <Category />}
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
          <Box>
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
  );

  if (categories.isLoading || availableIcons.isLoading) {
    return <Typography>Chargement...</Typography>;
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
          Gestion des Catégories
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle Catégorie
        </Button>
      </Box>
      {categories.data?.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune catégorie trouvée. Créez votre première catégorie pour
          commencer.
        </Alert>
      ) : (
        <Box>
          {categories.data?.map((category) => (
            <Box key={category.id} sx={{ mb: 2 }}>
              {renderCategoryCard(category)}
              {category.subcategories && category.subcategories.length > 0 && (
                <Box sx={{ ml: 2, mt: 1 }}>
                  {category.subcategories.map((subcategory) => (
                    <Box key={subcategory.id}>
                      {renderCategoryCard(subcategory, true)}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Dialog pour créer/modifier une catégorie */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingCategory?.id
            ? "Modifier la catégorie"
            : editingCategory?.parent_id
              ? "Nouvelle sous-catégorie"
              : "Nouvelle catégorie"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {editingCategory?.parent_id && !editingCategory?.id && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Cette catégorie sera créée comme sous-catégorie de :{" "}
                <strong>
                  {categories.data?.find(
                    (cat) => cat.id === editingCategory.parent_id,
                  )?.name || "Catégorie parente"}
                </strong>
              </Alert>
            )}
            <CategorieForm
              formId="CategorieForm"
              icons={availableIcons.data || []}
              onSubmit={handleSave}
              defaultValues={editingCategory}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Annuler
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            type="submit"
            form="CategorieForm"
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
