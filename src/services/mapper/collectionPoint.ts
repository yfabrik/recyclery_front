import type { CollectionPointDataInput } from "@recyclerie/api/schemas/collectionPoints";
import type { CollectionPointFormOutput, CollectionPointFormValues } from "../schema/collectionPoint";
import type { CollectionPointModel } from "../../interfaces/Models";

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
  export function collectionPointPayloadFromForm(data: CollectionPointFormOutput): CollectionPointDataInput {
    return {
      ...data,
    };
  }
