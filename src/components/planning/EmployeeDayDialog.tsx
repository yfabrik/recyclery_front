import { Alert, Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import type { IsoDate } from "@recyclerie/api/primitives/zod";
import { useId } from "react";
import type { Employee } from "../../employee";
import { useEmployeeDayTasks } from "../../hooks/useEmployeeDayTasks";
import { getApiErrorMessage } from "../../utils/apiToastMessage";
import { Loading } from "../Loading";
import { EmployeeDayDialogTitle } from "./employeeDay/EmployeeDayDialogTitle";
import { EmployeeDayView } from "./employeeDay/EmployeeDayView";

interface EmployeeDayDialogProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
  /** The day to show, `YYYY-MM-DD`: the clicked card's date in the displayed week. */
  date: IsoDate;
}

/**
 * The reverse of `TaskAssignmentDialog`: every Task of one day the Employee is assigned to,
 * could be assigned to, or cannot be, from `GET /api/employees/:id/tasks`. It lists the Tasks
 * of all the Employee's Stores whatever Store the Planning page is filtered on.
 */
export const EmployeeDayDialog = ({ open, onClose, employee, date }: EmployeeDayDialogProps) => {
  const titleId = useId();
  const dayQuery = useEmployeeDayTasks({ employeeId: employee.id, date, enabled: open });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth aria-labelledby={titleId}>
      <EmployeeDayDialogTitle
        employee={employee}
        date={date}
        workWindows={dayQuery.data?.workWindows}
        titleId={titleId}
      />
      <DialogContent>
        {dayQuery.isError ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => void dayQuery.refetch()}>
                Réessayer
              </Button>
            }
          >
            {getApiErrorMessage(dayQuery.error, "Erreur lors du chargement des tâches de l'employé")}
          </Alert>
        ) : (
          <Loading isLoading={dayQuery.isPending}>
            {dayQuery.data && <EmployeeDayView employee={employee} day={dayQuery.data} />}
          </Loading>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
