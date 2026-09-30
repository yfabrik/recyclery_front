type Employee = { id: number; prenom: string; nom: string };

const PALETTE = [
  "#4caf50",
  "#2196f3",
  "#ff9800",
  "#9c27b0",
  "#f44336",
  "#00bcd4",
  "#795548",
  "#607d8b",
];

/** `prenom nom`, ignoring the API's optional `fullName`. */
export const employeeName = (employee: Employee): string =>
  `${employee.prenom} ${employee.nom}`;

/** First letter of prenom and nom, uppercased; an empty field becomes "?". */
export const employeeInitials = (employee: Employee): string => {
  const first = employee.prenom.charAt(0) || "?";
  const last = employee.nom.charAt(0) || "?";
  return `${first}${last}`.toUpperCase();
};

/** Stable per Employee id; wraps around the module's private palette. */
export const employeeColor = (employee: Employee): string =>
  PALETTE[employee.id % PALETTE.length];

/** A sample palette color, for callers (e.g. a legend) that don't have an Employee to hand. */
export const sampleEmployeeColor = PALETTE[0];
