/**
 * @deprecated
 */

import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  type DialogProps,
} from "@mui/material";
import { CategorieForm } from "../../forms/CategorieForm";
import { Cancel, Save } from "@mui/icons-material";
interface CategorieModel {
  id: number;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  parent_id: number | null;
}
interface CategoryDialogProps {
  openDialog: boolean;
  editingCategory: CategorieModel|null;
  handleCloseDialog: DialogProps["onClose"];
  onSubmit: CallableFunction;
  categories:Array<CategorieModel>
  availableIcons:Array<{name:string,label:string}>
}
export const CategoryDialog = ({
  openDialog,
  editingCategory,
  handleCloseDialog,
  onSubmit,
  categories,
  availableIcons,
}: CategoryDialogProps) => {
  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {editingCategory
          ? "Modifier la catégorie"
          : editingCategory && editingCategory.parent_id
          ? "Nouvelle sous-catégorie"
          : "Nouvelle catégorie"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {editingCategory?.parent_id && !editingCategory && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Cette catégorie sera créée comme sous-catégorie de :{" "}
              <strong>
                {categories.find((cat) => cat.id === editingCategory?.parent_id)?.name ||
                  "Catégorie parente"}
              </strong>
            </Alert>
          )}
          <CategorieForm category={editingCategory} onSubmit={onSubmit} formId="CategorieForm" icons={availableIcons} />

          {editingCategory?.parent_id && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Cette catégorie sera créée comme sous-catégorie.
            </Alert>
          )}
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
  );
};
