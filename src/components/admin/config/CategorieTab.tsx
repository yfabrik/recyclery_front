import {
  Add,
  Cancel,
  Save
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Typography
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import { useQueryErrorToast } from "../../../hooks/useQueryErrorToast";
import type { CategoryModel } from "../../../interfaces/Models";
import {
  createCategory,
  deleteCategory,
  fetchCategories as fCat,
  fetchCategoryIcons,
  patchCategory as patchCategoryApi,
  updateCategory,
} from "../../../services/api/categories";
import { CategoryCard } from "../../CategoryCard";
import { CategorieForm, type Schema } from "../../forms/CategorieForm";
import { Loading } from "../../Loading";

export const CategoriesTab = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<Partial<CategoryModel> | null>(null);

  const queryClient = useQueryClient();

  const availableIcons = useQuery({
    queryFn: () => fetchCategoryIcons().then(result => result.data.icons),
    placeholderData: [],
    queryKey: ["icons"],
  });

  const categories = useQuery({
    queryFn: () =>
      fCat({ only_category: true, include: ["category"] }).then(
        (result) => result.data.data || [],
      ),
    queryKey: ["categorie", { only_category: true, include: "Category" }],
  });
  useQueryErrorToast(categories.error, "Erreur lors du chargement des catégories");

  const editCategory = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Schema }) =>
      updateCategory(id, data),
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Catégorie mise à jour avec succès"));
      queryClient.invalidateQueries({
        queryKey: ["categorie", { only_category: true, include: "Category" }],
      });
      handleCloseDialog();
    },
  });
  const addCategory = useMutation({
    mutationFn: (data: Schema) => createCategory(data),
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Catégorie créée avec succès"));
      queryClient.invalidateQueries({
        queryKey: ["categorie", { only_category: true, include: "Category" }],
      });
      handleCloseDialog();
    },
  });

  const removeCategory = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Catégorie supprimée avec succès"));
      queryClient.invalidateQueries({
        queryKey: ["categorie", { only_category: true, include: "Category" }],
      });
    },
  });

  const patchCategory = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { in?: boolean; out?: boolean; sell?: boolean };
    }) => patchCategoryApi(id, data),
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la mise à jour")),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Catégorie mise à jour avec succès"));
      queryClient.invalidateQueries({
        queryKey: ["categorie", { only_category: true, include: "Category" }],
      });
    },
  });

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
    if (editingCategory?.id)
      editCategory.mutate({ id: editingCategory.id, data: formData });
    else addCategory.mutate(formData);
  };

  const handleDelete = async (category: CategoryModel) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)
    ) {
      removeCategory.mutate(category.id);
    }
  };

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
      <Loading isLoading={categories.isLoading || availableIcons.isLoading}>

        {categories.data?.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Aucune catégorie trouvée. Créez votre première catégorie pour
            commencer.
          </Alert>
        ) : (
          <Box>
            {categories.data?.map((category) => (
              <Box key={category.id} sx={{ mb: 2 }}>
                <CategoryCard key={category.id} category={category} handleDelete={handleDelete} handleOpenDialog={handleOpenDialog} patchCategory={patchCategory} />
                {category.subcategories && category.subcategories.length > 0 && (
                  <Box sx={{ ml: 3, mt: 1 }}>
                    {category.subcategories.map((subcategory) => (
                      <CategoryCard key={subcategory.id} category={subcategory} handleDelete={handleDelete} handleOpenDialog={handleOpenDialog} patchCategory={patchCategory} isSubcategory={true} />
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

      </Loading>

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
            loading={addCategory.isPending || editCategory.isPending}
          >
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
