import type { Weekday } from "@recyclerie/api/enums";
import { WEEKDAYS_MONDAY_FIRST } from "@recyclerie/api/domain/date";
import { dayjs, weekdayLabel } from "../services/dateService";

const capitalize = (s: string) =>
  s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);

/** Mon-first list; `value` is JS Weekday 0=Sunday … 6=Saturday. */
export const DAYS_OF_WEEK: {
  value: Weekday;
  label: string;
  short: string;
}[] = WEEKDAYS_MONDAY_FIRST.map((value) => ({
  value,
  label: weekdayLabel(value),
  short: capitalize(
    dayjs("1970-01-04").locale("fr").add(value, "day").format("ddd"),
  ),
}));

export const TIME_SLOTS = [
  { value: "Ouverture", label: "Ouverture générale" },
  { value: "Matin", label: "Matin (9h-12h)" },
  { value: "Après-midi", label: "Après-midi (14h-18h)" },
  { value: "Soirée", label: "Soirée (18h-21h)" },
  { value: "Pause déjeuner", label: "Pause déjeuner" },
  { value: "Autre", label: "Autre créneau" },
];

export { PRIORITIES } from "../constants/taskPriorities";
export {
  RECURRENCE_PATTERN_FORM_OPTIONS as RECURRENCE_PATTERNS,
  getRecurrencePatternLabel,
} from "../constants/recurrencePatterns";

export const STATUS_OPTIONS = [
  { value: "new", label: "Nouveau", color: "grey", icon: " <Add /> " },
  { value: "planned", label: "Planifié", color: "primary", icon: " <Task />" },
  {
    value: "in_progress",
    label: "En cours",
    color: "warning",
    icon: "<PlayArrow />",
  },
  { value: "completed", label: "Terminé", color: "success", icon: "<Save />" },
  { value: "cancelled", label: "Annulé", color: "error", icon: "<Stop />" },
];
