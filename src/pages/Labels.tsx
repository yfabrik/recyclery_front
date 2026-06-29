import {
  Add,
  Bookmark,
  Delete,
  Edit,
  Euro,
  Inventory2,
  PointOfSale,
  Print,
  QrCode,
  Sell
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { useQueryErrorToast } from "../hooks/useQueryErrorToast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useLabelPrint } from "../components/LabelPrint";
import { Loading } from "../components/Loading";
import { StatCard } from "../components/StatCard";
import { LabelFiltersForm, type Filters } from "../components/forms/LabelFiltersForm";
import {
  LabeledItemForm,
  type Schema,
} from "../components/forms/LabeledItemForm";
import type { LabeledItemModel } from "../interfaces/Models";
import {
  getLabeledItemConditionColor,
  getLabeledItemConditionLabel,
} from "../constants/labeledItemConditions";
import {
  getLabeledItemStatusColor,
  getLabeledItemStatusLabel,
} from "../constants/labeledItemStatuses";
import { fetchCategories as fcat } from "../services/api/categories";
import {
  createLabeledItem,
  deleteLabeledItem,
  getItemStats,
  getLabeledItems,
  sellItem,
  updateLabeledItem
} from "../services/api/labeledItems";
import { formatCurrency, formatWeight } from "../services/cartService";

const Labels = () => {
  const { triggerPrintLabel, labelPrintNode } = useLabelPrint();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LabeledItemModel | null>(null);


  const [filters, setFilters] = useState<Filters>({
    status: "",
    category_id: "",
    search: "",
  });
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const items = useQuery({
    queryKey: ["items", { filters }, page],
    queryFn: () => {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.category_id)
        params.append("category_id", filters.category_id);
      if (filters.search) params.append("search", filters.search);
      params.append("page", page.toString());
      return getLabeledItems(params).then((response) => response.data);
    },
  });
  useQueryErrorToast(items.error, "Erreur lors du chargement des articles");

  const itemStats = useQuery({
    queryKey: ["itemStats", "items", { filters }],
    queryFn: () => {
      const params = new URLSearchParams();

      if (filters.status) params.append("status", filters.status);
      if (filters.category_id)
        params.append("category_id", filters.category_id);
      if (filters.search) params.append("search", filters.search);
      params.append("page", page.toString());
      return getItemStats(params).then((response) => response.data.stats)
    },
  })

  const categories = useQuery({
    queryKey: [
      "categories",
      { only_category: true, include: "category", sell: true },
    ],
    queryFn: () =>
      fcat({ only_category: true, include: "category", sell: true }).then(
        (response) => response.data.categories,
      ),
  });

  const addItem = useMutation({
    mutationFn: (data: Schema) => createLabeledItem(data),
    onSuccess: (data, variables) => {
      saved(data, variables);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });
  const editItem = useMutation({
    mutationFn: (data: { id: number; data: Schema }) =>
      updateLabeledItem(data.id, data.data),
    onSuccess: (data, variables, context) => {
      console.log(context, data, variables);
      return saved(data, variables.data);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });
  const removeItem = useMutation({
    mutationFn: (id: number) => deleteLabeledItem(id),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Article supprimé avec succès"));
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
  });

  const sell = useMutation({
    mutationFn: (id: number) => sellItem(id),
    onSuccess: (data) => {
      toast.success(getApiSuccessMessage(data, "Article marqué comme vendu"));
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la vente")),
  });

  const saved = (
    data: AxiosResponse<
      {
        success: true;
        message: string;
        item?: LabeledItemModel;
      },
      unknown,
      object
    >,
    variables: Schema,
  ) => {
    if (variables.autoPrint && data.data.item) {
      const item = data.data.item;
      if (!item.category && item.category_id && categories.data) {
        const cat = categories.data.find((c) => c.id === item.category_id);
        if (cat) item.category = cat;
      }
      if (
        item.category &&
        !item.subcategory &&
        item.subcategory_id != null
      ) {
        const sub = item.category?.subcategories?.find((c) => c.id === item.subcategory_id);
        if (sub) item.subcategory = sub;
      }
      triggerPrintLabel(data.data.item);
    }
    toast.success(
      getApiSuccessMessage(
        data,
        data.config.method == "post"
          ? "Article créé avec succès"
          : "Article mis à jour avec succès",
      ),
    );
    handleCloseDialog();
    queryClient.invalidateQueries({ queryKey: ["items"] });
  };


  const handleOpenDialog = (item: LabeledItemModel | null = null) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (data: Schema) => {
    if (editingItem?.id) editItem.mutate({ id: editingItem.id, data });
    else addItem.mutate(data);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }
    removeItem.mutate(id);
  };

  const handleSell = async (id: number) => {
    if (!window.confirm("Marquer cet article comme vendu ?")) {
      return;
    }
    sell.mutate(id);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <QrCode color="primary" />
          Étiquetage & Codes-barres
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{ minHeight: 48 }}
        >
          Nouvel Article
        </Button>
      </Box>
      {/* Statistiques rapides */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Articles disponibles"
            value={
              itemStats.data?.available_items || 0
            }
            icon={<Inventory2 />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Articles vendus"
            value={
              itemStats.data?.sold_items || 0
            }
            icon={<Sell />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Articles réservés"
            value={
              itemStats.data?.reserved_items || 0
            }
            icon={<Bookmark />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Valeur totale stock"
            value={formatCurrency(itemStats.data?.total_value || 0)}
            icon={<Euro />}
            color="info"
          />
        </Grid>
      </Grid>
      {/* Filtres */}
      <LabelFiltersForm
        defaultValues={filters}
        onChange={(values) =>
          setFilters((prev) => ({
            ...prev,
            ...values,
          }))}
        categories={categories.data ?? []}
      />
      {/* Table des articles */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code-barres</TableCell>
              <TableCell>Catégorie</TableCell>
              <TableCell>Sous-catégorie</TableCell>
              <TableCell>Poids</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>État</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Loading isLoading={items.isLoading} tableCols={8}>
              {items.data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                items.data?.items.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {item.barcode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item?.category?.name || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {item?.subcategory?.name || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.weight ? formatWeight(item.weight) : "-"}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary"
                      >
                        {formatCurrency(item.price)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getLabeledItemConditionLabel(item.condition_state)}
                        color={getLabeledItemConditionColor(item.condition_state)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={getLabeledItemStatusLabel(item.status)}
                        color={getLabeledItemStatusColor(item.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Imprimer étiquette">
                          <IconButton
                            size="small"
                            onClick={() => triggerPrintLabel(item)}
                          >
                            <Print />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(item)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {item.status === "available" && (
                          <Tooltip title="Marquer comme vendu">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleSell(item.id)}
                            >
                              <PointOfSale />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </Loading>
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: "flex", justifyContent: "center", paddingTop: 1 }}>
        <Pagination
          count={Math.trunc((items.data?.total || 0) / 50 || 10) + 1}
          color="primary"
          page={page}
          onChange={(e, val) => setPage(val)}
        />
      </Box>
      {/* Dialog de création/édition */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingItem ? `Modifier l'article ${editingItem.barcode}` : "Nouvel article"}
        </DialogTitle>
        <DialogContent>
          <LabeledItemForm
          key={editingItem?.id ?? "new"}
            formId="labelItemForm"
            categories={categories.data || []}
            onSubmit={handleSave}
            defaultValues={editingItem}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="labelItemForm" variant="contained">
            {editingItem ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
      {labelPrintNode}
    </Container>
  );
};

export default Labels;
