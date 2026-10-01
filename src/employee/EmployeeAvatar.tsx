import { Avatar, type SxProps, type Theme } from "@mui/material";
import { employeeColor, employeeInitials, employeeName, type Employee } from "./index";

export type EmployeeAvatarSize = "small" | "medium" | "large";

const SIZES: Record<EmployeeAvatarSize, { dimension: number; fontSize: string }> = {
  small: { dimension: 14, fontSize: "0.5rem" },
  medium: { dimension: 24, fontSize: "0.8rem" },
  large: { dimension: 32, fontSize: "0.875rem" },
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
  const { dimension, fontSize } = SIZES[size];

  return (
    <Avatar
      title={employeeName(employee)}
      sx={{
        width: dimension,
        height: dimension,
        fontSize,
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
