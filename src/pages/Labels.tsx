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
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useQueryErrorToast } from "../hooks/useQueryErrorToast";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";

import type {
  CreateLabeledItemResponse,
  UpdateLabeledItemResponse,
} from "@recyclerie/api/responses/items";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { AutoPrintToggle } from "../components/AutoPrintToggle";
import { useLabelPrint } from "../components/LabelPrint";
import { Loading } from "../components/Loading";
import { StatCard } from "../components/StatCard";
import { LabelFiltersForm } from "../components/forms/filters/LabelFiltersForm";
import {
  LabeledItemForm,
  type LabeledItemFormValues,
} from "../components/forms/LabeledItemForm";
import type { LabeledItemFormOutput } from "../services/schema/item";
import {
  LABEL_FILTER_DEFAULTS,
  labelFilterSchema,
  toLabelFilterInput,
} from "../services/schema/label";
import { labeledItemToFormValues } from "../services/mapper/label";
import { useUrlFilters } from "../hooks/useUrlFilters";
import {
  getLabeledItemConditionColor,
  getLabeledItemConditionLabel,
} from "../constants/labeledItemConditions";
import {
  getLabeledItemStatusColor,
  getLabeledItemStatusLabel,
} from "../constants/labeledItemStatuses";
import type { LabeledItemModel } from "../interfaces/Models";
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
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemBarcode, setEditingItemBarcode] = useState<string | null>(null);
  const [formDefaults, setFormDefaults] = useState<Partial<LabeledItemFormValues> | null>(null);
  const [autoPrint, setAutoPrint] = useState(true);

  const defaults = useMemo(
    () => labelFilterSchema.parse(LABEL_FILTER_DEFAULTS),
    [],
  );
  const { filters, setFilters, page, setPage } = useUrlFilters({
    schema: labelFilterSchema,
    defaults,
    withPage: true,
  });

  const queryClient = useQueryClient();
  const items = useQuery({
    queryKey: ["items", { filters }, page],
    queryFn: () => {
      return getLabeledItems({
        ...(filters.status && { status: filters.status }),
        ...(typeof filters.category_id === "number" && {
          category_id: filters.category_id,
        }),
        ...(filters.search && { search: filters.search }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
        page,
      }).then((response) => ({
        items: response.data.data,
        pagination: response.data.pagination,
        total: response.data.pagination.total,
      }));
    },
  });
  useQueryErrorToast(items.error, "Erreur lors du chargement des articles");

  const itemStats = useQuery({
    queryKey: ["itemStats", "items", { filters }],
    queryFn: () => {
      return getItemStats({
        ...(filters.status && { status: filters.status }),
        ...(typeof filters.category_id === "number" && {
          category_id: filters.category_id,
        }),
        ...(filters.search && { search: filters.search }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
        page,
      }).then((response) => response.data.data)
    },
  })

  const categories = useQuery({
    queryKey: [
      "categories",
      { only_category: true, include: ["category"], sell: true },
    ],
    queryFn: () =>
      fcat({ only_category: true, include: ["category"], sell: true }).then(
        (response) => response.data.data,
      ),
  });

  const addItem = useMutation({
    mutationFn: (data: LabeledItemFormOutput) => createLabeledItem(data),
    onSuccess: (data) => {
      saved(data);
    },
    onError: (error) => toast.error(getApiErrorMessage(error, "Erreur lors de la sauvegarde")),
  });
  const editItem = useMutation({
    mutationFn: (data: { id: number; data: LabeledItemFormOutput }) =>
      updateLabeledItem(data.id, data.data),
    onSuccess: (data) => {
      return saved(data);
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
    data: AxiosResponse<CreateLabeledItemResponse | UpdateLabeledItemResponse>,
  ) => {
    if (autoPrint && data.data.data) {
      const item = data.data.data;
      if (!item.category && item.category_id && categories.data) {
        const cat = categories.data.find((c) => c.id === item.category_id);
        if (cat) item.category = cat;
      }
      if (
        item.subcategory_id != null &&
        !item.subcategory &&
        item.category?.subcategories
      ) {
        const sub = item.category.subcategories.find((c) => c.id === item.subcategory_id);
        if (sub) item.subcategory = sub;
      }
      triggerPrintLabel(data.data.data);
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
    setEditingItemId(item?.id ?? null);
    setEditingItemBarcode(item?.barcode ?? null);
    setFormDefaults(item ? labeledItemToFormValues(item) : null);
    setAutoPrint(true);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItemId(null);
    setEditingItemBarcode(null);
    setFormDefaults(null);
  };

  const handleSave = async (data: LabeledItemFormOutput) => {
    if (editingItemId) editItem.mutate({ id: editingItemId, data });
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
              itemStats.data?.available_items ?? 0
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
            value={formatCurrency(Number(itemStats.data?.total_value || 0))}
            icon={<Euro />}
            color="info"
          />
        </Grid>
      </Grid>
      {/* Filtres */}
      <LabelFiltersForm
        defaultValues={toLabelFilterInput(filters)}
        onChange={setFilters}
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
              <TableCell>Date de création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <Loading isLoading={items.isLoading} tableCols={9}>
              {items.data?.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
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
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("fr-FR")
                        : "-"}
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
          count={Math.max(1, items.data?.pagination?.totalPages ?? 1)}
          color="primary"
          page={page}
          onChange={(_, val) => setPage(val)}
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
          {editingItemId ? `Modifier l'article ${editingItemBarcode}` : "Nouvel article"}
        </DialogTitle>
        <DialogContent>
          <LabeledItemForm
            key={editingItemId ?? "new"}
            formId="labelItemForm"
            categories={categories.data || []}
            onSubmit={handleSave}
            defaultValues={formDefaults}
          />
          <AutoPrintToggle checked={autoPrint} onChange={setAutoPrint} />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button type="submit" form="labelItemForm" variant="contained">
            {editingItemId ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogActions>
      </Dialog>
      {labelPrintNode}
    </Container>
  );
};

export default Labels;
