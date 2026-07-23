import type { RecycleryDataInput } from "@recyclerie/api/schemas/recycleries";
import type { StoreFormOutput, StoreFormValues } from "../schema/store";
import type { StoreModel } from "../../interfaces/Models";

export function storeToFormValues(store: StoreModel): Partial<StoreFormValues> {
    return {
      name: store.name,
      manager_id: store.manager_id ?? "",
      ...(store.address ? { address: store.address } : {}),
      city: store.city ?? "",
      postal_code: store.postal_code ?? "",
      phone: store.phone ?? "",
      email: store.email ?? "",
      is_active: store.is_active,
    };
  }
 export function storePayloadFromForm(data: StoreFormOutput): RecycleryDataInput {
    return {
      ...data,
    };
  }
