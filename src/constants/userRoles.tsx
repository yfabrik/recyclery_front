import {
  AdminPanelSettings,
  ManageAccounts,
  Work,
} from "@mui/icons-material";
import type { ChipProps } from "@mui/material";
import type { ReactElement } from "react";
import type { UserRole as ApiUserRole } from "@recyclerie/api/enums";

export type UserRoleValue = ApiUserRole;

export type UserRole = {
  [K in UserRoleValue]: {
    value: K;
    label: string;
    icon: ReactElement;
    color: NonNullable<ChipProps["color"]>;
  };
}[UserRoleValue];

function defineUserRoles<const T extends readonly UserRole[]>(
  roles: T & (UserRoleValue extends T[number]["value"] ? T : never),
): T {
  return roles;
}

export const USER_ROLES = defineUserRoles([
  {
    value: "admin",
    label: "Administrateur",
    icon: <AdminPanelSettings />,
    color: "error",
  },
  {
    value: "manager",
    label: "Gestionnaire",
    icon: <ManageAccounts />,
    color: "warning",
  },
  {
    value: "employee",
    label: "Employé",
    icon: <Work />,
    color: "info",
  },
] as const);

export const USER_ROLE_VALUES = [
  "admin",
  "manager",
  "employee",
] as const satisfies readonly UserRoleValue[];

export const getUserRole = (value: string) =>
  USER_ROLES.find((role) => role.value === value);

export const getUserRoleLabel = (role: UserRoleValue | string) =>
  getUserRole(role)?.label ?? role;

export const getUserRoleColor = (
  role: UserRoleValue | string,
): NonNullable<ChipProps["color"]> =>
  getUserRole(role)?.color ?? "default";

export const getUserRoleIcon = (role: UserRoleValue | string) =>
  getUserRole(role)?.icon;
