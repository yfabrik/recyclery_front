import { Chip, Box, Grid, Paper, Typography, Divider } from "@mui/material";
import { ArrivalForm, type ArrivalFormSchema } from "./forms/ArrivalForm";
import { createArrival, getArrivals } from "../services/api/arrival";
import { formatWeight } from "../services/cartService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { CategoryModel, CollectionPointModel } from "../interfaces/Models";
import type { UseFormReset } from "react-hook-form";
import { useState } from "react";

interface ArrivalAddProps {
  categories: CategoryModel[];
  collectionPoints: CollectionPointModel[];
}
export const ArrivalAdd = ({
  categories,
  collectionPoints,
}: ArrivalAddProps) => {
  const [formMethods, setFormMethods] = useState<{
    reset: UseFormReset<ArrivalFormSchema>;
  } | null>(null);

  const todayKey = () => new Date().toISOString().split("T")[0];
  const queryClient = useQueryClient();

  const {
    data: arrivals = {
      arrivals: [],
      pagination: {
        total: 0,
        page: 1,
        total_pages: 1,
        items_per_page: 50,
        has_next: false,
        has_previous: false,
        limit: 50,
        offset: 0,
      },
    },
  } = useQuery({
    queryKey: ["arrivals", "today"],
    queryFn: () =>
      getArrivals({
        date_from: todayKey(),
        date_to: todayKey(),
      }).then((result) => result.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (data: ArrivalFormSchema) => createArrival(data),
    onSuccess: (response) => {
      toast.success(
        `Arrivage ${response.data.arrival?.id} enregistré avec succès`,
      );

      queryClient.invalidateQueries({ queryKey: ["arrivals", "today"] });
      //TODO clear form
      formMethods?.reset();
    },

    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(
        error.response?.data?.error ?? "Erreur lors de l'enregistrement",
      );
    },
  });

  const handleSubmit = (data: ArrivalFormSchema) => {
    createMutation.mutate(data);
  };

  return (
    <Grid container spacing={3}>
      {/* Formulaire principal */}
      <ArrivalForm
        formId="arrivalForm"
        categories={categories}
        collectionPoints={collectionPoints}
        loading={createMutation.isPending}
        onSubmit={handleSubmit}
        onReady={setFormMethods}
      />

      {/* Résumé de la journée */}
      <Grid size={{ xs: 12, lg: 4 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Résumé du jour
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography>Nombre d'arrivages:</Typography>
            <Chip label={arrivals?.pagination.total??0} color="primary" />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography>Poids total:</Typography>
            <Chip
              label={formatWeight(
                arrivals.arrivals.reduce(
                  (sum, arr) => sum + (arr.weight || 0),
                  0,
                ),
              )}
              color="secondary"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Par provenance:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Points de collecte:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {
                  arrivals.arrivals.filter((arr) => arr.source_type === "point")
                    .length
                }
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Apports volontaires:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {
                  arrivals.arrivals.filter(
                    (arr) => arr.source_type === "apport",
                  ).length
                }
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2">Vides maison:</Typography>
              <Typography variant="body2" fontWeight="bold">
                {
                  arrivals.arrivals.filter(
                    (arr) => arr.source_type === "house_clearance",
                  ).length
                }
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};
