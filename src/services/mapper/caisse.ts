import type {
  CloseCaisseFormOutput,
  CreateCaisseFormOutput,
  OpenCaisseFormOutput,
} from "../schema/caisse";
import { emptyToNull } from "../zodTransform";

export type OpenCaissePayload = {
  store_id: number;
  cash_register_id: number;
  opening_amount: number;
  notes: string | null;
};

export type CloseCaissePayload = {
  closing_amount: number;
  notes: string | null;
};

export type CreateCaissePayload = {
  name: string;
};

export const openCaissePayloadFromForm = (
  data: OpenCaisseFormOutput,
): OpenCaissePayload => ({
  store_id: data.store_id,
  cash_register_id: data.cash_register_id,
  opening_amount: data.opening_amount,
  notes: emptyToNull(data.notes),
});

export const closeCaissePayloadFromForm = (
  data: CloseCaisseFormOutput,
): CloseCaissePayload => ({
  closing_amount: data.closing_amount,
  notes: emptyToNull(data.notes),
});

export const createCaissePayloadFromForm = (
  data: CreateCaisseFormOutput,
): CreateCaissePayload => ({
  name: data.name,
});
