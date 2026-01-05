export const DAYS_OF_WEEK = [
  { key: "monday", label: "Lundi", short: "Lun" },
  { key: "tuesday", label: "Mardi", short: "Mar" },
  { key: "wednesday", label: "Mercredi", short: "Mer" },
  { key: "thursday", label: "Jeudi", short: "Jeu" },
  { key: "friday", label: "Vendredi", short: "Ven" },
  { key: "saturday", label: "Samedi", short: "Sam" },
  { key: "sunday", label: "Dimanche", short: "Dim" },
];

export const TIME_SLOTS = [
  { value: "Ouverture", label: "Ouverture générale" },
  { value: "Matin", label: "Matin (9h-12h)" },
  { value: "Après-midi", label: "Après-midi (14h-18h)" },
  { value: "Soirée", label: "Soirée (18h-21h)" },
  { value: "Pause déjeuner", label: "Pause déjeuner" },
  { value: "Autre", label: "Autre créneau" },
];

export const PRIORITIES = [
  { value: "low", label: "Faible", color: "success", icon: "<FlagOutlined />" },
  { value: "medium", label: "Moyenne", color: "warning", icon: "<Flag />" },
  { value: "high", label: "Élevée", color: "error", icon: "<PriorityHigh />" },
  { value: "urgent", label: "Urgente", color: "error", icon: "" },
];

export const RECURRENCE_PATTERNS = [
  { value: "none", label: "Aucune" },
  { value: "daily", label: "Quotidienne" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuelle" },
  { value: "custom", label: "Personnalisée" },
];

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
