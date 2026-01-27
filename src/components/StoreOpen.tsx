import { Add, Delete, Edit, Store } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { DAYS_OF_WEEK as daysOfWeek } from "../interfaces/shared";
import type { StoreHoursModel, StoreModel } from "../interfaces/Models";

interface StoreOpenProps {
  store: StoreModel;
  handleOpenHoursDialog: (hours?: StoreHoursModel | null, storeId?: number) => void;
  handleDeleteHours: (hourId: number) => void;
  hours: StoreHoursModel[];
}
export const StoreOpen = ({
  store,
  hours,
  handleOpenHoursDialog,
  handleDeleteHours,
}: StoreOpenProps) => {
  return (
    <Card>
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Store color="primary" />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {store.name || "Magasin inconnu"}
            </Typography>
          </Box>
        }
        action={
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={() => handleOpenHoursDialog(null, store.id)}
          >
            Ajouter
          </Button>
        }
      />
      <CardContent>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Jour</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Horaires</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hours
                .sort(
                  (a, b) =>
                    daysOfWeek.findIndex((d) => d.key === a.day_of_week) -
                    daysOfWeek.findIndex((d) => d.key === b.day_of_week),
                )
                .map((hour) => (
                  <TableRow key={hour.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {daysOfWeek.find((d) => d.key === hour.day_of_week)
                          ?.label || hour.day_of_week}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {!hour.is_open ? (
                        <Chip label="Fermé" color="error" size="small" />
                      ) : hour.is_24h ? (
                        <Chip label="24h/24" color="success" size="small" />
                      ) : (
                        <Chip label="Ouvert" color="success" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {!hour.is_open
                          ? "Fermé"
                          : hour.is_24h
                            ? "24h/24"
                            : `${new Date(hour.open_time).toLocaleString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )} - ${new Date(hour.close_time).toLocaleString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}`}
                      </Typography>
                      {hour.notes && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {hour.notes}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenHoursDialog(hour)}
                        color="primary"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteHours(hour.id)}
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
