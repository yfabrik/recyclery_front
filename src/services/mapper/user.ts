import type { UserFormOutput, UserFormValues } from "../schema/user";
import { emptyToNull } from "../zodTransform";

export type UserFormPayload = {
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  password: string;
  role: UserFormOutput["role"];
  recyclery_id: number | null;
  isActive: boolean;
  managedStores: number[];
};

export function userPayloadFromForm(data: UserFormOutput): UserFormPayload {
  return {
    username: data.username,
    email: data.email,
    first_name: emptyToNull(data.first_name),
    last_name: emptyToNull(data.last_name),
    phone: emptyToNull(data.phone),
    password: data.password,
    role: data.role,
    recyclery_id: data.recyclery_id === "" ? null : data.recyclery_id,
    isActive: data.isActive,
    managedStores: data.managedStores,
  };
}

export function userToFormValues(
  user: Partial<UserFormPayload> & {
    id?: number;
    first_name?: string | null;
    last_name?: string | null;
    phone?: string | null;
    recyclery_id?: number | null;
  },
): Partial<UserFormValues> {
  return {
    username: user.username ?? "",
    email: user.email ?? "",
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    phone: user.phone ?? "",
    password: user.password ?? "",
    role: user.role,
    recyclery_id: user.recyclery_id ?? "",
    isActive: user.isActive ?? true,
    managedStores: user.managedStores ?? [],
  };
}
