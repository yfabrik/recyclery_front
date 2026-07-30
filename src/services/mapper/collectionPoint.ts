import type { CollectionPointDataInput } from "@recyclerie/api/schemas/collectionPoints";
import type { CollectionPointModel } from "../../interfaces/Models";
import type {
  CollectionPointFormOutput,
  CollectionPointFormValues,
} from "../schema/collectionPoint";
import { emptyToNull } from "../zodTransform";

export function collectionPointToFormValues(
  point: CollectionPointModel,
): Partial<CollectionPointFormValues> {
  return {
    name: point.name,
    address: point.address ?? "",
    city: point.city ?? "",
    postal_code: point.postal_code ?? "",
    contact_person: point.contact_person ?? "",
    contact_phone: point.contact_phone ?? "",
    contact_email: point.contact_email ?? "",
    notes: point.notes ?? "",
    is_active: point.is_active,
    recyclery_id: point.recyclery_id ?? "",
  };
}

export function collectionPointPayloadFromForm(
  data: CollectionPointFormOutput,
): CollectionPointDataInput {
  return {
    name: data.name,
    address: data.address,
    city: data.city,
    postal_code: data.postal_code,
    contact_person: emptyToNull(data.contact_person),
    contact_phone: emptyToNull(data.contact_phone),
    contact_email: emptyToNull(data.contact_email),
    notes: emptyToNull(data.notes),
    is_active: data.is_active,
    recyclery_id: data.recyclery_id === "" ? null : data.recyclery_id,
  } satisfies CollectionPointDataInput;
}
