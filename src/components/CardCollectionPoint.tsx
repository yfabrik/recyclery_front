import { Add, Delete, Edit, Email, LocationOn, Phone, Store } from "@mui/icons-material"
import { Avatar, Box, Button, Card, CardContent, CardHeader, Chip, IconButton, List, ListItem, ListItemAvatar, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import type { CollectionPointModel, ScheduleModel } from "../interfaces/Models"


interface CardCollectionPointProps {
    point: CollectionPointModel
    handleOpenHoursDialog: (n: null | ScheduleModel, id?: number) => void
    handleDeleteHours: (id: number) => void

}
export const CardCollectionPoint = ({
    point,
    handleOpenHoursDialog,
    handleDeleteHours

}: CardCollectionPointProps) => {
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
                            {point.name || "point inconnu"}
                        </Typography>
                    </Box>
                }
                action={
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => handleOpenHoursDialog(null, point.id)}
                    >
                        Ajouter
                    </Button>
                }
            />
            <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                        <Store />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" component="h2">
                            {point.name}
                        </Typography>
                        <Chip
                            label="Active"
                            color="success"
                            size="small"
                            variant="outlined"
                        />
                    </Box>
                </Box>

                <List dense>
                    <ListItem disablePadding>
                        <ListItemAvatar>
                            <LocationOn color="action" />
                        </ListItemAvatar>
                        <Typography variant="body2">{point.address}</Typography>
                        <Typography variant="caption" color="textSecondary">
                            {point.city} {point.postal_code}
                        </Typography>
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemAvatar>
                            <Phone color="action" />
                        </ListItemAvatar>
                        <ListItemText
                            primary={point.contact_phone}
                            slotProps={{
                                primary: { variant: "body2" }
                            }}
                        />
                    </ListItem>

                    <ListItem disablePadding>
                        <ListItemAvatar>
                            <Email color="action" />
                        </ListItemAvatar>
                        <ListItemText
                            primary={point.contact_email}
                            slotProps={{
                                primary: { variant: "body2" }
                            }}
                        />
                    </ListItem>


                </List>


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

                            {point.TaskSchedules
                                ?.sort(
                                    (a, b) => new Date(a.scheduled_date).getDay() -
                                        new Date(b.scheduled_date).getDay()

                                )
                                .map((hour) => (
                                    <TableRow key={hour.id}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: "bold", textTransform: "capitalize" }}>
                                                {new Date(hour.scheduled_date).toLocaleString(undefined, { weekday: "long" })}
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

                                                    : `${new Date(hour.start_time).toLocaleString(
                                                        "fr-FR",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )} - ${new Date(hour.end_time).toLocaleString(
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
    )
}