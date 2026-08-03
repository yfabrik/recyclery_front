import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import type { EmployeeVacationDto } from "@recyclerie/api/responses/vacations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { UseFormReset } from "react-hook-form";
import type { EmployeeModel } from "../interfaces/Models";
import {
    createVacation,
    deleteVacation,
    getEmployeeVacations,
    updateVacation,
} from "../services/api/vacations";
import {
    vacationPayloadFromForm,
    vacationToFormValues,
    vacationUpdatePayloadFromForm,
} from "../services/mapper/vacation";
import {
    VACATION_FORM_DEFAULTS,
    type VacationFormOutput,
    type VacationFormValues,
} from "../services/schema/vacation";
import { VacationForm } from "./forms/VacationForm";
import { Loading } from "./Loading";
import { Delete, Edit } from "@mui/icons-material";
import { getVacationReasonLabel } from "../constants/vacationReasons";

interface VacationDialogProps {
    open: boolean;
    handleClose: () => void;
    selectedEmployee: EmployeeModel;
}

export const VacationDialog = ({
    open,
    handleClose,
    selectedEmployee,
}: VacationDialogProps) => {
    const queryClient = useQueryClient();
    const [selectedVacation, setSelectedVacation] =
        useState<EmployeeVacationDto | null>(null);
    const [formMethods, setFormMethods] = useState<{
        reset: UseFormReset<VacationFormValues>;
    } | null>(null);

    const vacationsQuery = useQuery({
        queryKey: ["vacations", selectedEmployee.id],
        queryFn: () => getEmployeeVacations(selectedEmployee.id),
        enabled: open,
    });

    const invalidateVacations = () => {
        queryClient.invalidateQueries({
            queryKey: ["vacations", selectedEmployee.id],
        });
    };

    const resetForm = () => {
        setSelectedVacation(null);
        formMethods?.reset(VACATION_FORM_DEFAULTS);
    };

    const createVacationMutation = useMutation({
        mutationFn: (data: VacationFormOutput) =>
            createVacation(selectedEmployee.id, vacationPayloadFromForm(data)),
        onSuccess: () => {
            resetForm();
            invalidateVacations();
        },
    });

    const updateVacationMutation = useMutation({
        mutationFn: (data: VacationFormOutput) => {
            if (!selectedVacation) throw new Error("Selected vacation is required");
            return updateVacation(
                selectedVacation.id,
                vacationUpdatePayloadFromForm(data))
        }       ,
        onSuccess: () => {
            resetForm();
            invalidateVacations();
        },
    });

    const deleteVacationMutation = useMutation({
        mutationFn: (vacationId: EmployeeVacationDto["id"]) =>
            deleteVacation(vacationId),
        onSuccess: () => {
            resetForm();
            invalidateVacations();
        },
    });

    const handleSubmit = (data: VacationFormOutput) => {
        if (selectedVacation) {
            updateVacationMutation.mutate(data);
        } else {
            createVacationMutation.mutate(data);
        }
    };

    const handleEditVacation = (vacation: EmployeeVacationDto) => {
        setSelectedVacation(vacation);
        formMethods?.reset(vacationToFormValues(vacation));
    };

    const handleDeleteVacation = (vacation: EmployeeVacationDto) => {
        if (window.confirm("Supprimer ce congé ?")) {
            deleteVacationMutation.mutate(vacation.id);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>Congés</DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 2 }}>
                    <VacationForm
                        onSubmit={handleSubmit}
                        onReady={setFormMethods}
                        onReset={() => setSelectedVacation(null)}
                        formId="vacationForm"
                    />
                    <Loading isLoading={vacationsQuery.isLoading}>
                        <VacationList
                            vacations={vacationsQuery.data?.data.data ?? []}
                            onEdit={handleEditVacation}
                            onDelete={handleDeleteVacation}
                        />
                    </Loading>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Fermer</Button>
            </DialogActions>
        </Dialog>
    );
};

const VacationList = ({
    vacations,
    onEdit,
    onDelete,
}: {
    vacations: EmployeeVacationDto[];
    onEdit: (vacation: EmployeeVacationDto) => void;
    onDelete: (vacation: EmployeeVacationDto) => void;
}) => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Date de début</TableCell>
                    <TableCell>Date de fin</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Actions</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {vacations.map((vacation) => (
                    <TableRow key={vacation.id}>
                        <TableCell>{vacation.start_date}</TableCell>
                        <TableCell>{vacation.end_date}</TableCell>
                        <TableCell>{getVacationReasonLabel(vacation.reason)}</TableCell>
                        <TableCell>
                            <IconButton
                                size="small"
                                onClick={() => onEdit(vacation)}
                                color="primary"
                            >
                                <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => onDelete(vacation)}
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
);
