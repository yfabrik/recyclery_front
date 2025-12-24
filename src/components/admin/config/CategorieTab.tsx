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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import {
  createCategory,
  deleteCategory,
  fetchCategories as fCat,
  fetchCategoryIcons,
  updateCategory,
} from "../../../services/api/categories";

interface CategoryProps {
  id: number;
  name: string;
  description: string;
  icon?: string;
  parent_id?: number;
  subcategories?: CategoryProps[];
}

interface CategorieModel {
  id: number;
  name: string;
  description: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  parent_id: number | null;
}

export const CategoriesTab = () => {
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryProps | null>(
    null
  );
  // const [formData, setFormData] = useState({
  //   name: "",
  //   description: "",
  //   icon: "",
  //   parent_id: null,
  // });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchAvailableIcons();
  }, []);

  const fetchCategories = async () => {
    try {
      // const token = localStorage.getItem("token");
      const response = await fCat();

      // Organiser les catégories en structure hiérarchique
      const allCategories = response.data.categories || [];
      const mainCategories = allCategories.filter(
        (cat: CategoryProps) => !cat.parent_id
      );
      const subcategories = allCategories.filter(
        (cat: CategoryProps) => cat.parent_id
      );

      // Ajouter les sous-catégories à leurs catégories parentes
      const organizedCategories = mainCategories.map(
        (category: CategoryProps) => ({
          ...category,
          subcategories: subcategories.filter(
            (sub: CategoryProps) => sub.parent_id === category.id
          ),
        })
      );

      setCategories(organizedCategories);
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableIcons = async () => {
    try {
      // const token = localStorage.getItem("token");
      const response = await fetchCategoryIcons();
      const icons = response.data.icons || [];
      setAvailableIcons(
        icons.map((icon:{name:string,label:string}) => ({
          name: icon,
          label: icon,
        }))
      );
    } catch (error) {
      console.error("Erreur lors du chargement des icônes:", error);
    }
  };

  const form = useForm<
    Pick<CategorieModel, "name" | "description" | "icon" | "parent_id">
  >({
    defaultValues: { name: "", description: "", icon: "", parent_id: null },
  });
  const parent_id = useWatch({ control: form.control, name: "parent_id" });

  const handleOpenDialog = (
    category: CategoryProps | null = null,
    parentId = null
  ) => {
    if (category) {
      setEditingCategory(category);
      form.reset({
        name: category.name,
        description: category.description || "",
        icon: category.icon || "",
        parent_id: category.parent_id || null,
      });
      // setFormData({
      //   name: category.name,
      //   description: category.description || "",
      //   icon: category.icon || "",
      //   parent_id: category.parent_id || null,
      // });
    } else {
      setEditingCategory(null);
      form.reset({ parent_id: parentId });
      // setFormData({
      //   name: "",
      //   description: "",
      //   icon: "",
      //   parent_id: parentId,
      // });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    form.reset();
    // setFormData({ name: "", description: "", icon: "", parent_id: null });
  };

  const handleSave = async (
    formData: Pick<
      CategorieModel,
      "name" | "description" | "icon" | "parent_id"
    >
  ) => {
    try {
      // const token = localStorage.getItem("token");

      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        // await axios.put(`/api/categories/${editingCategory.id}`, formData, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        toast.success("Catégorie mise à jour avec succès");
      } else {
        await createCategory(formData);
        // await axios.post("/api/categories", formData, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        toast.success("Catégorie créée avec succès");
      }

      handleCloseDialog();
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Erreur lors de la sauvegarde"
      );
    }
  };

  const handleDelete = async (category: CategoryProps) => {
    if (
      window.confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)
    ) {
      try {
        await deleteCategory(category.id);
        toast.success("Catégorie supprimée avec succès");
        fetchCategories();
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Erreur lors de la suppression"
        );
      }
    }
  };

  const getIconComponent = (iconName:string) => {
    // Import dynamique des icônes Material-UI
    const iconMap = {
      Category,
      Inventory,
      Settings,
      Palette,
      AdminPanelSettings,
    };

    const IconComponent = iconMap[iconName] || Category;
    return <IconComponent />;
  };

  const renderCategoryCard = (
    category: CategoryProps,
    isSubcategory = false
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

  if (loading) {
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

      {categories.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune catégorie trouvée. Créez votre première catégorie pour
          commencer.
        </Alert>
      ) : (
        <Box>
          {categories.map((category) => (
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
          {editingCategory
            ? "Modifier la catégorie"
            : parent_id
            ? "Nouvelle sous-catégorie"
            : "Nouvelle catégorie"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {parent_id && !editingCategory && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Cette catégorie sera créée comme sous-catégorie de :{" "}
                <strong>
                  {categories.find((cat) => cat.id === parent_id)?.name ||
                    "Catégorie parente"}
                </strong>
              </Alert>
            )}
            {/* <CategorieForm formId="CategorieForm" icons={availableIcons} /> */}

            <form id="CategorieForm" onSubmit={form.handleSubmit(handleSave)}>
              <Controller
                name="name"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Nom de la catégorie"
                    {...field}
                    margin="normal"
                    required
                  />
                )}
              />
              <Controller
                name="description"
                control={form.control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Nom de la catégorie"
                    {...field}
                    margin="normal"
                    multiline
                    rows={3}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="categorieIcon">Icône</InputLabel>
                    <Select labelId="categorieIcon" label="Icône" {...field}>
                      <MenuItem key="no-icon" value="">
                        <em>Aucune icône</em>
                      </MenuItem>
                      {availableIcons.map((icon) => (
                        <MenuItem key={icon.name} value={icon.name}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            {getIconComponent(icon.name)}
                            {icon.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </form>

            {/* <TextField
              fullWidth
              label="Nom de la catégorie"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              margin="normal"
              multiline
              rows={3}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel>Icône</InputLabel>
              <Select
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                label="Icône"
              >
                <MenuItem key="no-icon" value="">
                  <em>Aucune icône</em>
                </MenuItem>
                {availableIcons.map((icon) => (
                  <MenuItem key={icon.name} value={icon.name}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {getIconComponent(icon.name)}
                      {icon.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}

            {parent_id && (
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
          {/* <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            disabled={!formData.name.trim()}
          >
            Sauvegarder
          </Button> */}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
