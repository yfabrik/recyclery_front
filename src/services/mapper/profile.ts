import type { ProfileFormOutput, ProfileFormValues } from "../schema/profile";
import { emptyToNull } from "../zodTransform";

export type ProfileFormPayload = {
  username: string;
  email: string;
  phone: string | null;
};

export function profilePayloadFromForm(
  data: ProfileFormOutput,
): ProfileFormPayload {
  return {
    username: data.username,
    email: data.email,
    phone: emptyToNull(data.phone),
  };
}

export function profileToFormValues(
  profile: Partial<ProfileFormPayload>,
): Partial<ProfileFormValues> {
  return {
    username: profile.username ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
  };
}
