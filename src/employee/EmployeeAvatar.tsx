import { Avatar, type SxProps, type Theme } from "@mui/material";
import { employeeColor, employeeInitials, employeeName, type Employee } from "./index";

export type EmployeeAvatarSize = "small" | "medium" | "large";

const DIMENSION_PX: Record<EmployeeAvatarSize, number> = {
  small: 14,
  medium: 24,
  large: 32,
};

const FONT_SIZE: Record<EmployeeAvatarSize, string> = {
  small: "0.5rem",
  medium: "0.8rem",
  large: "0.875rem",
};

interface EmployeeAvatarProps {
  employee: Employee;
  /** @default "medium" */
  size?: EmployeeAvatarSize;
  /** Call-site decoration (e.g. a highlight border); merged over the avatar's own styles. */
  sx?: SxProps<Theme>;
}

/** An Employee's color, initials and name, as a sized avatar with a hover tooltip. */
export const EmployeeAvatar = ({ employee, size = "medium", sx }: EmployeeAvatarProps) => {
  const dimension = DIMENSION_PX[size];

  return (
    <Avatar
      title={employeeName(employee)}
      sx={{
        width: dimension,
        height: dimension,
        fontSize: FONT_SIZE[size],
        bgcolor: employeeColor(employee),
        color: "white",
        fontWeight: "bold",
        ...sx,
      }}
    >
      {employeeInitials(employee)}
    </Avatar>
  );
};
