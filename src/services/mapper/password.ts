import type { PasswordChangeFormOutput } from "../schema/password";

/** Password change API body — form output already matches (no empty→null). */
export function passwordChangePayloadFromForm(
  data: PasswordChangeFormOutput,
): PasswordChangeFormOutput {
  return data;
}
