import {
  Inventory,
  TouchApp,
  Visibility
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { ArrivalAdd } from "../components/ArrivalAdd";
import { ArrivalHistory } from "../components/ArrivalHistory";
import { fetchCategories as fcat } from "../services/api/categories";
import { fetchCollectionPoints as fCollP } from "../services/api/collectionPoint";



const Arrivals = () => {

  const [showForm, setShowForm] = useState(true);
  // const [showHistory, setShowHistory] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: [
      "categories",
      {
        include: ["category"],
        only_category: true,
        in: true,
      },
    ],
    queryFn: () =>
      fcat({
        include: ["category"],
        only_category: true,
        in: true,
      }).then((result) => result.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const { data: collectionPoints = [] } = useQuery({
    queryKey: ["collectionPoints", { active_only: "true" }],
    queryFn: () =>
      fCollP({ active_only: "true" }).then(
        (result) => result.data.data ?? [],
      ),
    staleTime: 5 * 60 * 1000,
  });


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
                // setShowHistory(false);
              }}
              startIcon={<TouchApp />}
              size="large"
            >
              Saisie
            </Button>
            <Button
              variant={!showForm ? "contained" : "outlined"}
              onClick={() => {
                // setShowHistory(true);
                setShowForm(false);
              }}
              startIcon={<Visibility />}
              size="large"
            >
              Historique
            </Button>
          </Box>
        </Box>
      </Paper>
      {showForm && (
        <ArrivalAdd categories={categories} collectionPoints={collectionPoints} />
      )}
      {!showForm && (
        <ArrivalHistory categories={categories} />
      )}

    </Container>
  );
};

export default Arrivals;
