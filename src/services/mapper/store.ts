import type { RecycleryDataInput } from "@recyclerie/api/schemas/recycleries";
import type { StoreModel } from "../../interfaces/Models";
import type { StoreFormOutput, StoreFormValues } from "../schema/store";
import { emptyToNull } from "../zodTransform";

export function storeToFormValues(
  store: StoreModel,
): Partial<StoreFormValues> {
  return {
    name: store.name,
    manager_id: store.manager_id ?? "",
    address: store.address ?? "",
    city: store.city ?? "",
    postal_code: store.postal_code ?? "",
    phone: store.phone ?? "",
    email: store.email ?? "",
    is_active: store.is_active,
  };
}

export function storePayloadFromForm(
  data: StoreFormOutput,
): RecycleryDataInput {
  return {
    name: data.name,
    manager_id: data.manager_id === "" ? null : data.manager_id,
    address: emptyToNull(data.address),
    city: emptyToNull(data.city),
    postal_code: emptyToNull(data.postal_code),
    phone: emptyToNull(data.phone),
    email: emptyToNull(data.email),
    is_active: data.is_active,
  } satisfies RecycleryDataInput;
}
