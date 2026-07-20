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

import type { CategoryDataInput, CategoryPatchInput } from "@recyclerie/api/schemas/categories";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";
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
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../../../utils/apiToastMessage";
import { CategoryCard } from "../../CategoryCard";
import { CategorieForm, type CategorieFormValues, type Schema } from "../../forms/CategorieForm";
import { Loading } from "../../Loading";

//TODO just ignore null values ?
function categoryToFormValues(
  category: Partial<CategoryModel>,
): Partial<CategorieFormValues> {
  return {
    name: category.name ?? "",
    description: category.description ?? "",
    icon: category.icon ?? "",
    defaultPrice: category.defaultPrice ?? 0,
    defaultWeight: category.defaultWeight ?? 0,
    parent_id: category.parent_id ?? null,
    priceBasedOnWeight: category.priceBasedOnWeight ?? false,
    bundlePrice: category.bundlePrice ?? "",
    bundleQuantity: category.bundleQuantity ?? "",
  };
}

export const CategoriesTab = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<CategoryModel["id"] | null>(null);//TODO revenir au CategorieModel complet ?
  const [formDefaults, setFormDefaults] = useState<Partial<CategorieFormValues> | null>(
    null,
  );

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

  const formDataToApi = (data: Schema): CategoryDataInput => ({...data})//TODO rename comme les autres?
  
  const editCategory = useMutation({
    mutationFn: ({ id, data }: { id: CategoryModel["id"]; data: Schema }) =>
      updateCategory(id, formDataToApi(data)),
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
    mutationFn: (data: Schema) => createCategory(formDataToApi(data)),
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
    mutationFn: (id: CategoryModel["id"]) => deleteCategory(id),
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
      id: CategoryModel["id"];
      data:CategoryPatchInput;
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
    parent_id: CategoryModel["parent_id"] = null,
  ) => {
    if (category) {
      setEditingCategoryId(category.id);
      setFormDefaults(categoryToFormValues(category));
    } else {
      setEditingCategoryId(null);
      setFormDefaults(parent_id ? { parent_id } : null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategoryId(null);
    setFormDefaults(null);
  };

  const handleSave = async (formData: Schema) => {
    if (editingCategoryId)
      editCategory.mutate({ id: editingCategoryId, data: formData });
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
          {editingCategoryId
            ? "Modifier la catégorie"
            : formDefaults?.parent_id
              ? "Nouvelle sous-catégorie"
              : "Nouvelle catégorie"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {formDefaults?.parent_id != null && !editingCategoryId && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Cette catégorie sera créée comme sous-catégorie de :{" "}
                <strong>
                  {categories.data?.find(
                    (cat) => cat.id === formDefaults.parent_id,
                  )?.name || "Catégorie parente"}
                </strong>
              </Alert>
            )}
            <CategorieForm
              formId="CategorieForm"
              icons={availableIcons.data || []}
              onSubmit={handleSave}
              defaultValues={formDefaults ?? undefined}
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
