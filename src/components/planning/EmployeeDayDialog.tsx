import { Alert, Button, Dialog, DialogActions, DialogContent } from "@mui/material";
import type { IsoDate } from "@recyclerie/api/primitives/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useId } from "react";
import type { Employee } from "../../employee";
import { useEmployeeDayTasks } from "../../hooks/useEmployeeDayTasks";
import { getApiErrorMessage } from "../../utils/apiToastMessage";
import { Loading } from "../Loading";
import { EmployeeDayDialogTitle } from "./employeeDay/EmployeeDayDialogTitle";
import { EmployeeDayView } from "./employeeDay/EmployeeDayView";
import { invalidateAfterEmployeeDayChanges } from "./employeeDay/refreshAfterChanges";
import { useEmployeeDayEditor } from "./employeeDay/useEmployeeDayEditor";

interface EmployeeDayDialogProps {
  open: boolean;
  onClose: () => void;
  /**
   * Called once when the dialog closed after at least one change, and its writes have been
   * sent. The dialog has then already refreshed `EMPLOYEE_DAY_STALE_QUERY_KEYS` (the Planning
   * `tasks` queries among them); this is for anything else that depends on the day's Tasks.
   */
  onCloseWithChanges?: () => void;
  employee: Employee;
  /** The day to show, `YYYY-MM-DD`: the clicked card's date in the displayed week. */
  date: IsoDate;
}

/**
 * The reverse of `TaskAssignmentDialog`: every Task of one day the Employee is assigned to,
 * could be assigned to, or cannot be, from `GET /api/employees/:id/tasks`. It lists the Tasks
 * of all the Employee's Stores whatever Store the Planning page is filtered on.
 *
 * Like the Task dialog it works on local state: assigning ("+"), unassigning (trash) and
 * adjusting the Employee's Time ranges on a Task (sliders, add, delete) update the dialog at
 * once and are written through the shared write queue; a refused write
 * reverts to the server's state with an error toast. Closing after a change refreshes the
 * Planning page's caches; closing without one refreshes nothing.
 */
export const EmployeeDayDialog = ({ open, onClose, onCloseWithChanges, employee, date }: EmployeeDayDialogProps) => {
  const titleId = useId();
  const queryClient = useQueryClient();
  const dayQuery = useEmployeeDayTasks({ employeeId: employee.id, date, enabled: open });
  const { refetch } = dayQuery;
  const editor = useEmployeeDayEditor({
    employeeId: employee.id,
    day: dayQuery.data,
    isFetching: dayQuery.isFetching,
    open,
    refetchDay: () => refetch().then((result) => result.data),
  });

  const handleClose = () => {
    onClose();
    void editor.finish().then((changed) => {
      if (!changed) return;
      void invalidateAfterEmployeeDayChanges(queryClient);
      onCloseWithChanges?.();
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth aria-labelledby={titleId}>
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
          <Loading isLoading={dayQuery.isPending || !editor.ready}>
            {dayQuery.data && (
              <EmployeeDayView
                employee={employee}
                day={dayQuery.data}
                rows={editor.rows}
                onAssign={editor.assignTask}
                onUnassign={editor.unassignTask}
                onAddRange={editor.addRange}
                onRemoveRange={editor.removeRange}
                onUpdateRange={editor.updateRange}
              />
            )}
          </Loading>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};
