import type { PromotionDataInput } from "@recyclerie/api/schemas/promotions";
import type { PromoModel } from "../../interfaces/Models";
import { toIsoDate } from "../dateService";
import type { PromoFormOutput, PromoFormValues } from "../schema/promotion";

export type PromoEditModel = PromoModel & { subcategory_id?: number | null };

export function promoToFormValues(
  promo: PromoEditModel,
): Partial<PromoFormValues> {
  return {
    category_id: promo.category_id as PromoFormValues["category_id"],
    subcategory_id: promo.subcategory_id ?? "",
    promotionValue: promo.promotionValue,
    startDate: new Date(promo.startDate),
    endDate: promo.endDate ? new Date(promo.endDate) : "",
    isActive: promo.isActive,
    stores: promo.stores?.length ? promo.stores.map((store) => store.id) : [""],
  };
}

export const promoPayloadFromForm = (
  data: PromoFormOutput,
): PromotionDataInput => {
  const storeIds = data.stores.filter(
    (store): store is number => typeof store === "number",
  );
  return {
    category_id:
      data.subcategory_id !== "" ? data.subcategory_id : data.category_id,
    promotionValue: data.promotionValue,
    startDate: toIsoDate(data.startDate),
    endDate: data.endDate === "" ? null : toIsoDate(data.endDate),
    isActive: data.isActive,
    stores: storeIds.length > 0 ? storeIds : null,
  } satisfies PromotionDataInput;
};
