import { useMemo } from "react";
import { ArrivalFilterForm } from "./forms/filters/ArrivalFilterForm";
import { arrivalFilterSchema, getArrivalFilterDefaults } from "../services/schema/arrival";
import { getArrivals } from "../services/api/arrival";
import { Box, Chip, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Business, Home, LocalShipping, VolunteerActivism } from "@mui/icons-material";
import type { ArrivalModel } from "../interfaces/Models";
import { useQuery } from "@tanstack/react-query";
import { muiPageCount } from "../services/api/pagination";
import { useUrlFilters } from "../hooks/useUrlFilters";

export const ArrivalHistory = () => {
    const defaults = useMemo(() => getArrivalFilterDefaults(), []);
    const { filters, setFilters, page, setPage } = useUrlFilters({
        schema: arrivalFilterSchema,
        defaults,
        withPage: true,
    });

    const { data: arrivals = { arrivals: [], pagination: { total: 0, page: 1, perPage: 50, totalPages: 1, hasNext: false, hasPrevious: false } } }
        = useQuery({
            queryKey: ["arrivals", filters, page],
            queryFn: () =>
                getArrivals({
                    date_from: filters.date_from,
                    date_to: filters.date_to,
                    ...(filters.source_type !== "" ? { source_type: filters.source_type } : {}),
                    ...(filters.collection_point_id !== "" ? { collection_point_id: filters.collection_point_id } : {}),
                    page,
                }).then((result) => ({
                    arrivals: result.data.data,
                    pagination: result.data.pagination,
                })),
        });
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
        <>
            <Paper sx={{ p: 2, mb: 3 }}>
                <ArrivalFilterForm
                    defaultValues={filters}
                    onChange={setFilters}
                />
            </Paper>
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
                        {arrivals.arrivals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="textSecondary">
                                        Aucun arrivage enregistré aujourd'hui
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            arrivals.arrivals.map((arrival: ArrivalModel) => (
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
            <Box sx={{ display: "flex", justifyContent: "center", padding: 1 }}>
                <Pagination
                    count={muiPageCount(arrivals.pagination)}
                    color="primary"
                    page={page}
                    onChange={(_e, val) => setPage(val)}
                />
            </Box>
        </Paper>
        </>
    )
}