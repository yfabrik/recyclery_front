import { AccountBalance, Add, Delete, Edit, Email, LocationOn, Person, Phone, Schedule, Store } from "@mui/icons-material"
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Chip, IconButton, List, ListItem, ListItemAvatar, ListItemText, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import type { ScheduleModel, StoreModel } from "../interfaces/Models"
import { formatTime } from "../services/dateService"


interface CardStoreProps {
    store: StoreModel
    handleOpenHoursDialog: (n: null | ScheduleModel, id?: number) => void
    handleDeleteHours: (id: number) => void
    handleOpenDialog: (store: null | StoreModel) => void
    handleDeleteStore: (store: StoreModel) => void
    handleOpenCashRegisters: (store: StoreModel) => void

}
export const CardStore = ({
    store,
    handleOpenHoursDialog,
    handleDeleteHours,
    handleOpenDialog,
    handleDeleteStore,
    handleOpenCashRegisters

}: CardStoreProps) => {
    const locationSecondary = [store.city, store.postal_code]
        .filter((value): value is string => value != null && value !== "")
        .join(" ");

    return (
        <Card>
            <CardHeader
                title={
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar sx={{ bgcolor: store.is_active ? "primary.main" : "default.main", mr: 2 }}>
                            <Store />
                        </Avatar>
                        <Box>
                            <Typography variant="h6" component="h2">
                                {store.name}
                            </Typography>
                            {store.is_active ? (
                                <Chip
                                    label="Active"
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                />) : (
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
                action={<>
                    <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(store)}
                        color="primary"
                    >
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => handleDeleteStore(store)}
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
                            primary={store.address}
                            secondary={locationSecondary}
                            slotProps={{
                                primary: { variant: "body2" },
                                secondary: { variant: "caption" }
                            }} />

                    </ListItem>

                    {store.phone && <ListItem disablePadding>
                        <ListItemAvatar>
                            <Phone color="action" />
                        </ListItemAvatar>
                        <ListItemText
                            primary={store.phone}
                            slotProps={{
                                primary: { variant: "body2" }
                            }}
                        />
                    </ListItem>}

                    {store.email && <ListItem disablePadding>
                        <ListItemAvatar>
                            <Email color="action" />
                        </ListItemAvatar>
                        <ListItemText
                            primary={store.email}
                            slotProps={{
                                primary: { variant: "body2" }
                            }}
                        />
                    </ListItem>}
                    <ListItem disablePadding>
                        <ListItemAvatar>
                            <Person color="action" />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                store.manager?.username ? (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Person fontSize="small" />
                                        {store.manager.username}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Non assigné
                                    </Typography>
                                )
                            }
                            slotProps={{
                                primary: { variant: "body2", component: "div" }
                            }}
                        />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemAvatar>
                            <Box component="span" sx={{ ml: 0.4, display: "flex", alignItems: "center" }}>
                                <AccountBalance color="action" fontSize="small" />
                            </Box>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={<AccountBalance />}
                                    onClick={() => handleOpenCashRegisters(store)}
                                >
                                    {store.caisses?.length || 0} caisse(s)
                                </Button>
                            }
                            slotProps={{
                                primary: { variant: "body2" }
                            }}
                        />
                    </ListItem>


                </List>

                {store.TaskSchedules?.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1} py={2}>
                        <Schedule fontSize="large" color="primary" sx={{ mx: "auto" }} />
                        <Typography variant="body2" color="text.secondary" align="center">
                            Aucun horaire de présence pour ce magasin
                        </Typography>
                    </Box>
                ) :
                    (
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

                                    {store.TaskSchedules
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
                                                        <Chip label="Fermé" color="error" size="small" />
                                                    ) : (
                                                        <Chip label="Ouvert" color="success" size="small" />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {
                                                            `${formatTime(new Date(hour.start_time))} - ${formatTime(new Date(hour.end_time))}`
                                                        }
                                                    </Typography>
                                                    {/* {hour.notes && (
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            display="block"
                                                        >
                                                            {hour.notes}
                                                        </Typography>
                                                    )} */}
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
                        </TableContainer>)}
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => handleOpenHoursDialog(null, store.id)}>
                    Ajouter
                </Button>
            </CardActions>
        </Card>
    )
}