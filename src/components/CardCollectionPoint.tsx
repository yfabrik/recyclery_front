import {
  Add,
  Delete,
  Edit,
  Email,
  LocationOn,
  Phone,
  Schedule,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { CollectionPointModel, ScheduleModel } from "../interfaces/Models";
import { formatTime } from "../services/dateService";
interface CardCollectionPointProps {
  point: CollectionPointModel;
  handleOpenHoursDialog: (n: null | ScheduleModel, id?: number) => void;
  handleDeleteHours: (id: number) => void;
  handleOpenDialog: (point: null | CollectionPointModel) => void;
  handleDeletePoint: (point: CollectionPointModel) => void;
}
export const CardCollectionPoint = ({
  point,
  handleOpenHoursDialog,
  handleDeleteHours,
  handleOpenDialog,
  handleDeletePoint,
}: CardCollectionPointProps) => {
  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: point.is_active ? "primary.main" : "default.main",
                mr: 2,
              }}
            >
              <LocationOn />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h2">
                {point.name}
              </Typography>
              {point.is_active ? (
                <Chip
                  label="Active"
                  color="success"
                  size="small"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label="Inactive"
                  color="default"
                  size="small"
                  variant="filled"
                />
              )}
            </Box>
          </Box>
        }
        action={
          <>
            <IconButton
              size="small"
              onClick={() => handleOpenDialog(point)}
              color="primary"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeletePoint(point)}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </>
        }
      />
      <CardContent>
        <List dense>
          <ListItem disablePadding>
            <ListItemAvatar>
              <LocationOn color="action" />
            </ListItemAvatar>
            <ListItemText
              primary={point.address}
              secondary={`${point.city} ${point.postal_code}`}
              slotProps={{
                primary: { variant: "body2" },
                secondary: { variant: "caption" },
              }}
            />
          </ListItem>
          {point.contact_phone && (
            <ListItem disablePadding>
              <ListItemAvatar>
                <Phone color="action" />
              </ListItemAvatar>
              <ListItemText
                primary={point.contact_phone}
                slotProps={{
                  primary: { variant: "body2" },
                }}
              />
            </ListItem>
          )}
          {point.contact_email && (
            <ListItem disablePadding>
              <ListItemAvatar>
                <Email color="action" />
              </ListItemAvatar>
              <ListItemText
                primary={point.contact_email}
                slotProps={{
                  primary: { variant: "body2" },
                }}
              />
            </ListItem>
          )}
        </List>
        { !point.TaskSchedules || point.TaskSchedules.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1}
            py={2}
          >
            <Schedule fontSize="large" color="primary" sx={{ mx: "auto" }} />
            <Typography variant="body2" color="text.secondary" align="center">
              Aucun horaire de présence pour ce point de collecte
            </Typography>
          </Box>
        ) : (
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
                {point.TaskSchedules?.sort(
                  (a, b) =>
                    new Date(a.scheduled_date ?? 0).getDay() -
                    new Date(b.scheduled_date ?? 0).getDay(),
                )
                  .map((hour) => (
                    <TableRow key={hour.id}>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                          }}
                        >
                          {hour.scheduled_date
                            ? new Date(hour.scheduled_date).toLocaleString(
                                undefined,
                                { weekday: "long" },
                              )
                            : hour.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {!hour.is_recurring ? (
                          <Chip label="Inactif" color="error" size="small" />
                        ) : (
                          <Chip label="Présent" color="success" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {!hour.is_recurring
                            ? "Inactif"
                            : hour.start_time && hour.end_time
                              ? `${formatTime(new Date(hour.start_time))} - ${formatTime(new Date(hour.end_time))}`
                              : hour.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleOpenHoursDialog(hour as ScheduleModel)
                          }
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
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => handleOpenHoursDialog(null, point.id)}
        >
          Ajouter
        </Button>
      </CardActions>
    </Card>
  );
};
