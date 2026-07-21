import type { PromotionDataInput } from "@recyclerie/api/schemas/promotions";
import type { PromoModel } from "../../interfaces/Models";
import type { PromoFormOutput, PromoFormValues } from "../schema/promotion";

export type PromoEditModel = PromoModel & { subcategory_id?: number | null };

export function promoToFormValues(promo: PromoEditModel): Partial<PromoFormValues> {
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

export const promoPayloadFromForm = (data: PromoFormOutput): PromotionDataInput => {
    const category_id = data.subcategory_id ?? data.category_id
    const result = { ...data, category_id }
    return result
};
