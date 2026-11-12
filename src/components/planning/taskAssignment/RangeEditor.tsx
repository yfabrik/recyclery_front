import { AddCircleOutline, Delete } from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { MinuteWindow } from "@recyclerie/api/domain/timeRange";
import { formatMinutes, type LocalRange } from "./geometry";
import { RangeSlider } from "./RangeSlider";

/**
 * The per-Time-range building blocks of both assignment dialogs: the Task dialog shows them
 * for one Employee on the Task, the Employee day dialog for the Employee on each Task they
 * hold. `subject` names who/what the controls act on in their accessible names ("Léa Martin",
 * or "Léa Martin sur Tri arrivage" where several cards sit side by side).
 */

interface AddRangeButtonProps {
  subject: string;
  /** False when no free window is left: the button is disabled and a tooltip says so. */
  canAdd: boolean;
  onAdd: () => void;
}

/** "Ajouter une plage horaire", disabled with an explanatory tooltip when there is no room. */
export const AddRangeButton = ({ subject, canAdd, onAdd }: AddRangeButtonProps) => (
  <Tooltip describeChild title={canAdd ? "" : "Plus de plage horaire libre"}>
    <span>
      <Button
        size="small"
        startIcon={<AddCircleOutline />}
        disabled={!canAdd}
        aria-label={`Ajouter une plage horaire pour ${subject}`}
        onClick={onAdd}
      >
        Ajouter une plage horaire
      </Button>
    </span>
  </Tooltip>
);

interface RangeEditorRowProps {
  /** The Task's span; the slider covers exactly this. */
  task: MinuteWindow;
  range: LocalRange;
  /** 1-based position among the Employee's ranges on the Task, earliest first. */
  position: number;
  /** Whether the range may be deleted: only when the Employee holds several on the Task. */
  removable: boolean;
  color: string;
  subject: string;
  /** Where this range may sit: the allowed windows, the rest of the Task is drawn as blocked. */
  free: readonly MinuteWindow[];
  onChange: (start: number, end: number) => void;
  onRemove: () => void;
}

/** "Plage horaire N · HH:MM–HH:MM", its delete button when removable, and its slider. */
export const RangeEditorRow = ({
  task,
  range,
  position,
  removable,
  color,
  subject,
  free,
  onChange,
  onRemove,
}: RangeEditorRowProps) => {
  const label = `plage horaire ${position}`;
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          Plage horaire {position} · {formatMinutes(range.start)}–{formatMinutes(range.end)}
        </Typography>
        {removable ? (
          <Tooltip title="Retirer cette plage horaire">
            <IconButton size="small" aria-label={`Retirer le ${label} de ${subject}`} onClick={onRemove}>
              <Delete fontSize="inherit" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
      <RangeSlider
        task={task}
        range={range}
        label={label}
        color={color}
        free={free}
        employeeName={subject}
        onChange={onChange}
      />
    </Box>
  );
};
