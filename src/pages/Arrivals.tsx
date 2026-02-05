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
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { ArrivalForm } from "../components/forms/ArrivalForm";
import { createArrival, getArrivals } from "../services/api/arrival";
import { fetchCategories as fcat } from "../services/api/categories";
import { fetchCollectionPoints as fCollP } from "../services/api/collectionPoint";
import type {
  CategoryModel,
  CollectionPointModel,
  ArrivalModel,
} from "../interfaces/Models";

const Arrivals = () => {
  const [categories, setCategories] = useState<CategoryModel[]>([]);
  const [collectionPoints, setCollectionPoints] = useState<
    CollectionPointModel[]
  >([]);
  const [arrivals, setArrivals] = useState<ArrivalModel[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchCollectionPoints();
    fetchTodaysArrivals();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fcat({ include: "category", only_category: true });
      setCategories(response.data.categories || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
      console.error("Erreur:", error);
    }
  };

  const fetchCollectionPoints = async () => {
    try {
      const response = await fCollP({ active_only: "true" });
      setCollectionPoints(response.data.collection_points || []);
    } catch (error) {
      console.error("Erreur lors du chargement des points de collecte:", error);
    }
  };

  const fetchTodaysArrivals = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await getArrivals({ date_from: today, date_to: today });

      setArrivals(response.data.arrivals || []);
    } catch (error) {
      console.error("Erreur lors du chargement des arrivages:", error);
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await createArrival(data);
      if (response.data.success) {
        toast.success(
          `Arrivage ${response.data.arrival.arrival_number} enregistré avec succès`,
        );
        // Rafraîchir la liste
        fetchTodaysArrivals();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Erreur lors de l'enregistrement",
      );
    } finally {
      setLoading(false);
    }
  };

  const getSourceTypeLabel = (type) => {
    const types = {
      collection_point: "Point de Collecte",
      volunteer_donation: "Apport Volontaire",
      house_clearance: "Vide Maison",
    };
    return types[type] || type;
  };

  const getSourceTypeIcon = (type) => {
    const icons = {
      collection_point: <LocalShipping />,
      volunteer_donation: <VolunteerActivism />,
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
            loading={loading}
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
                  label={`${arrivals
                    .reduce((sum, arr) => sum + parseFloat(arr.weight || 0), 0)
                    .toFixed(1)} kg`}
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
                      arrivals.filter(
                        (arr) => arr.source_type === "collection_point",
                      ).length
                    }
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Apports volontaires:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {arrivals.filter((arr) => arr.volunteer_donation).length}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2">Vides maison:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {arrivals.filter((arr) => arr.house_clearance).length}
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
                          {arrival.arrival_number}
                        </Typography>
                      </TableCell>
                      <TableCell>{arrival.arrival_time}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {arrival.category_name}
                          </Typography>
                          {arrival.subcategory_name && (
                            <Typography variant="caption" color="textSecondary">
                              {arrival.subcategory_name}
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
                            {arrival.collection_point_name && (
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {arrival.collection_point_name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {arrival.processed_by_name || "Inconnu"}
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
