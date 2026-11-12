import { Alert, AlertTitle, Button } from "@mui/material";
import type { EmployeeVacationDto } from "@recyclerie/api/responses/vacations";
import { getVacationReasonLabel } from "../../../constants/vacationReasons";

interface VacationConflictBannerProps {
  reason: EmployeeVacationDto["reason"];
  /** How many Tasks the Employee still holds that day (at least one). */
  taskCount: number;
  /** Removes the Employee from all of those Tasks. */
  onRemoveAll: () => void;
}

const tasks = (count: number) => (count === 1 ? "1 tâche" : `${count} tâches`);

/**
 * A **Vacation conflict**: the Employee is on Vacation that day yet still holds Tasks (a
 * Vacation added after the Assignment leaves their Time ranges in place). One click removes
 * them from every Task they hold; the view then shows the plain "En congé" info instead.
 */
export const VacationConflictBanner = ({ reason, taskCount, onRemoveAll }: VacationConflictBannerProps) => (
  <Alert
    severity="error"
    sx={{ mb: 2 }}
    action={
      <Button color="inherit" size="small" variant="outlined" onClick={onRemoveAll}>
        Retirer de {tasks(taskCount)}
      </Button>
    }
  >
    <AlertTitle>En congé ({getVacationReasonLabel(reason)}) mais encore assigné</AlertTitle>
    Assigné à {tasks(taskCount)} ce jour.
  </Alert>
);
