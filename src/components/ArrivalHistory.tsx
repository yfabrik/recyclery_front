import { useMemo } from "react";
import { ArrivalFilterForm } from "./forms/filters/ArrivalFilterForm";
import {
  arrivalFilterFormSchema,
  getArrivalFilterFormDefaults,
} from "../services/schema/arrival";
import { toArrivalQuery } from "../services/mapper/arrival";
import { deleteArrival, getArrivals } from "../services/api/arrival";
import {
  Box,
  Chip,
  IconButton,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Business, Delete } from "@mui/icons-material";
import type { ArrivalModel } from "../interfaces/Models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { muiPageCount } from "../services/api/pagination";
import { useUrlFilters } from "../hooks/useUrlFilters";
import {
  getArrivalSourceLabel,
  getArrivalSourceType,
} from "../constants/arrivalSourceTypes";
import { dayjs, formatDate, now } from "../services/dateService";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { useAuth } from "../contexts/AuthContext";

export const ArrivalHistory = () => {
  const { user } = useAuth();
  const defaults = useMemo(() => getArrivalFilterFormDefaults(), []);
  const { filters, setFilters, page, setPage } = useUrlFilters({
    schema: arrivalFilterFormSchema,
    defaults,
    withPage: true,
  });
  const query = useMemo(() => toArrivalQuery(filters), [filters]);

  const queryclient = useQueryClient();
  const {
    data: arrivals = {
      arrivals: [],
      pagination: {
        total: 0,
        page: 1,
        perPage: 50,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      },
    },
  } = useQuery({
    queryKey: ["arrivals", query, page],
    queryFn: () =>
      getArrivals({ ...query, page }).then((result) => ({
        arrivals: result.data.data,
        pagination: result.data.pagination,
      })),
  });
  const deleteArrivalMutation = useMutation({
    mutationFn: (id: ArrivalModel["id"]) => {
      return deleteArrival(id);
    },
    onSuccess: (response) => {
      toast.success(getApiSuccessMessage(response, "supression success"));
      queryclient.invalidateQueries({ queryKey: ["arrivals", query, page] });
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Erreur lors de la suppression")),
  });
  const onDelete = (id: number) => {
    if (!window.confirm("supprimer l'arrivage ?")) return;
    deleteArrivalMutation.mutate(id);
  };
  return (
    <>
      <Paper sx={{ p: 2, mb: 3 }}>
        <ArrivalFilterForm defaultValues={filters} onChange={setFilters} />
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Arrivages du jour ({formatDate(now().toDate())})
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>N° Arrivage</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Heure</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Poids</TableCell>
                <TableCell>Provenance</TableCell>
                <TableCell>Saisi par</TableCell>
                <TableCell>actions</TableCell>
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
                    <TableCell>{formatDate(arrival.arrival_date)}</TableCell>
                    <TableCell>{arrival.arrival_time}</TableCell>
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
                        {getArrivalSourceType(arrival.source_type)?.icon ?? (
                          <Business />
                        )}
                        <Box>
                          <Typography variant="body2">
                            {getArrivalSourceLabel(arrival.source_type)}
                          </Typography>
                          {arrival.CollectionPoint && (
                            <Typography variant="caption" color="textSecondary">
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
                    <TableCell>
                      {dayjs(arrival.createdAt).add(30, "minute").isAfter(now()) &&
                        arrival.processed_by === user?.id && (
                          
                          <IconButton
                            onClick={() => onDelete(arrival.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                          
                        )}
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
  );
};
