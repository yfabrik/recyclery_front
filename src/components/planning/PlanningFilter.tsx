import {
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { StoreModel } from "../../interfaces/Models";

interface PlanningFilterProps {
  selectedStore: number | string;
  stores: StoreModel[];
  selectedLocation: string;
  setSelectedStore: (a: number | string) => void;
  setSelectedLocation: (a: string) => void;
  locations: object[];
}

export const PlanningFilter = ({
  stores,
  selectedLocation,
  selectedStore,
  setSelectedLocation,
  setSelectedStore,
  locations,
}: PlanningFilterProps) => {
  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth>
            <InputLabel>Filtrer par magasin</InputLabel>
            <Select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
                setSelectedLocation(""); // Reset location when store changes
              }}
              label="Filtrer par magasin"
            >
              <MenuItem value="">
                <em>Tous les magasins</em>
              </MenuItem>
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        {/* <Grid size={{ xs: 12, sm: 4 }}>
          <FormControl fullWidth disabled={!selectedStore}>
            <InputLabel>Filtrer par lieu</InputLabel>
            <Select
              value={selectedLocation}
              onChange={(e) => {
                setSelectedLocation(e.target.value);
              }}
              label="Filtrer par lieu"
            >
              <MenuItem value="">
                <em>Tous les lieux</em>
              </MenuItem>
              {locations
                .filter(
                  (loc) =>
                    !selectedStore || loc.store_id === parseInt(selectedStore)
                )
                .map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid> */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedStore
              ? `Affichage des tâches pour ${stores.find((s) => s.id === parseInt(selectedStore))?.name || "magasin sélectionné"}`
              : "Affichage de toutes les tâches"}
            {/* {selectedLocation &&
              ` - Lieu: ${locations.find((l) => l.id === parseInt(selectedLocation))?.name || "lieu sélectionné"}`} */}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
