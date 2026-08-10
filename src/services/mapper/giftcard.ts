import type { GiftCardIssueInput } from "@recyclerie/api/schemas/giftCards";
import { toIsoDate } from "../dateService";
import type { CreateGiftCardFormOutput } from "../schema/giftcard";
import { emptyToNull } from "../zodTransform";

export const createGiftCardPayloadFromForm = (
  data: CreateGiftCardFormOutput,
): GiftCardIssueInput => {
  // Code généré côté frontend pour éviter de demander à l'utilisateur de le saisir.
  // Le backend peut toujours décider de le remplacer/valider selon ses règles.
  const generatedCode = `GC-${Date.now().toString(36).toUpperCase()}`;
  return {
    code: generatedCode,
    initial_value: data.initial_value,
    expires_at: data.expires_at == null ? null : toIsoDate(data.expires_at),
    note: emptyToNull(data.note),
    recipient_name: emptyToNull(data.recipient_name),
    recipient_email: emptyToNull(data.recipient_email),
  } satisfies GiftCardIssueInput;
};