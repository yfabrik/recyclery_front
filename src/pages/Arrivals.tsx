import {
  Business,
  Home,
  Inventory,
  LocalShipping,
  TouchApp,
  Visibility,
  VolunteerActivism,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "react-toastify";

import {
  ArrivalForm,
  type ArrivalFormSchema,
} from "../components/forms/ArrivalForm";
import type { ArrivalModel } from "../interfaces/Models";
import { createArrival, getArrivals } from "../services/api/arrival";
import { fetchCategories as fcat } from "../services/api/categories";
import { fetchCollectionPoints as fCollP } from "../services/api/collectionPoint";
import { formatWeight } from "../services/cartService";

const todayKey = () => new Date().toISOString().split("T")[0];

const Arrivals = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: [
      "categories",
      {
        include: "category",
        only_category: true,
        in: true,
      },
    ],
    queryFn: () =>
      fcat({
        include: "category",
        only_category: true,
        in: true,
      }).then((result) => result.data.categories ?? []),
    staleTime: 5 * 60 * 1000,
  });
  const { data: collectionPoints = [] } = useQuery({
    queryKey: ["collectionPoints",{ active_only: "true" }],
    queryFn: () =>
      fCollP({ active_only: "true" }).then(
        (result) => result.data.collection_points ?? [],
      ),
    staleTime: 5 * 60 * 1000,
  });
  const { data: arrivals = [] } = useQuery({
    queryKey: ["arrivals", "today", todayKey()],
    queryFn: () =>
      getArrivals({
        date_from: todayKey(),
        date_to: todayKey(),
      }).then((result) => result.data.arrivals ?? []),
  });

  const createMutation = useMutation({
    mutationFn: (data: ArrivalFormSchema) => createArrival(data),
    onSuccess: (response) => {
      toast.success(
        `Arrivage ${response.data.arrival?.id} enregistré avec succès`,
      );

      queryClient.invalidateQueries({ queryKey: ["arrivals"] });
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

  const getSourceTypeLabel = (type: ArrivalModel["source_type"]): string => {
    const types: Record<ArrivalModel["source_type"], string> = {
      point: "Point de Collecte",
      apport: "Apport Volontaire",
      house_clearance: "Vide Maison",
    };
    return types[type] || type;
  };

  const getSourceTypeIcon = (
    type: ArrivalModel["source_type"],
  ): React.ReactNode => {
    const icons: Record<ArrivalModel["source_type"], React.ReactNode> = {
      point: <LocalShipping />,
      apport: <VolunteerActivism />,
      house_clearance: <Home />,
    };
    return icons[type] || <Business />;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, minHeight: "100vh" }}>
      {/* En-tête avec interface tactile */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: "#f8f9fa" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              <Inventory sx={{ mr: 1, verticalAlign: "middle" }} />
              Saisie des Arrivages
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Interface tactile pour l'enregistrement des arrivages
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={showForm ? "contained" : "outlined"}
              onClick={() => {
                setShowForm(true);
                setShowHistory(false);
              }}
              startIcon={<TouchApp />}
              size="large"
            >
              Saisie
            </Button>
            <Button
              variant={showHistory ? "contained" : "outlined"}
              onClick={() => {
                setShowHistory(true);
                setShowForm(false);
              }}
              startIcon={<Visibility />}
              size="large"
            >
              Historique ({arrivals.length})
            </Button>
          </Box>
        </Box>
      </Paper>
      {showForm && (
        <Grid container spacing={3}>
          {/* Formulaire principal */}
          <ArrivalForm
            formId="arrivalForm"
            categories={categories}
            collectionPoints={collectionPoints}
            loading={createMutation.isPending}
            onSubmit={handleSubmit}
          />

          {/* Résumé de la journée */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Résumé du jour
              </Typography>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>Nombre d'arrivages:</Typography>
                <Chip label={arrivals.length} color="primary" />
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography>Poids total:</Typography>
                <Chip
                  label={formatWeight(arrivals
                    .reduce((sum, arr) => sum + (arr.weight || 0), 0))}
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
                      arrivals.filter((arr) => arr.source_type === "point")
                        .length
                    }
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Apports volontaires:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {
                      arrivals.filter((arr) => arr.source_type === "apport")
                        .length
                    }
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Vides maison:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {
                      arrivals.filter(
                        (arr) => arr.source_type === "house_clearance",
                      ).length
                    }
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      {showHistory && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Arrivages du jour ({new Date().toLocaleDateString("fr-FR")})
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>N° Arrivage</TableCell>
                  <TableCell>Heure</TableCell>
                  <TableCell>Catégorie</TableCell>
                  <TableCell>Poids</TableCell>
                  <TableCell>Provenance</TableCell>
                  <TableCell>Saisi par</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arrivals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="textSecondary">
                        Aucun arrivage enregistré aujourd'hui
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  arrivals.map((arrival) => (
                    <TableRow key={arrival.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {arrival.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {arrival.arrival_time}
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {arrival.categorie?.name}
                          </Typography>
                          {arrival.subcategorie && (
                            <Typography variant="caption" color="textSecondary">
                              {arrival.subcategorie.name}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${arrival.weight} kg`}
                          size="small"
                          color="secondary"
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getSourceTypeIcon(arrival.source_type)}
                          <Box>
                            <Typography variant="body2">
                              {getSourceTypeLabel(arrival.source_type)}
                            </Typography>
                            {arrival.CollectionPoint && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {arrival.CollectionPoint.name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {arrival.User?.username || "Inconnu"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default Arrivals;
