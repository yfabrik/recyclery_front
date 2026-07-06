import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { isGiftCardUnusable } from "../constants/giftCardStatuses";
import {
  formatCurrency,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  getGlobalPromotionDiscount,
  getPaymentBalance,
} from "../services/cartService";
import { getGiftCardByCode } from "../services/api/giftCards";
import { getApiErrorMessage } from "../utils/apiToastMessage";
import {
  schema,
  type CartFormValues,
  type Schema as CartSchema,
} from "../components/forms/cartSchema";

const recalculatePaymentSplits = (
  currentSplits: CartSchema["payment_splits"],
  total: number,
): CartSchema["payment_splits"] => {
  let remainingForGiftCards = total;
  return currentSplits.map((split) => {
    if (split.method !== "giftcard") {
      return split;
    }

    const giftUsage = Math.max(
      Math.min(split.gift_card_current_value ?? 0, remainingForGiftCards),
      0,
    );
    remainingForGiftCards = Math.max(remainingForGiftCards - giftUsage, 0);
    return { ...split, amount: giftUsage };
  });
};

const arePaymentSplitsEqual = (
  left: CartSchema["payment_splits"],
  right: CartSchema["payment_splits"],
) => {
  if (left.length !== right.length) return false;
  return left.every((split, index) => {
    const compared = right[index];
    return (
      split.method === compared.method &&
      (Number(split.amount) || 0) === (Number(compared.amount) || 0) &&
      split.gift_card_barcode === compared.gift_card_barcode &&
      split.gift_card_id === compared.gift_card_id
    );
  });
};

interface UseCheckoutFormCoreOptions {
  defaultValues: CartFormValues | CartSchema;
  autoRecalculateGiftCardSplits?: boolean;
}

export const useCheckoutFormCore = ({
  defaultValues,
  autoRecalculateGiftCardSplits = true,
}: UseCheckoutFormCoreOptions) => {
  const [giftCardScanInput, setGiftCardScanInput] = useState("");

  const form = useForm<CartFormValues, unknown, CartSchema>({
    defaultValues: defaultValues as CartFormValues,
    resolver: zodResolver(schema),
  });

  const {
    fields: cartFields,
    append: appendCartItem,
    update: updateCartItem,
    remove: removeCartItem,
  } = useFieldArray({
    control: form.control,
    name: "cart",
  });
  const {
    fields: paymentFields,
    append: appendPayment,
    remove: removePayment,
  } = useFieldArray({
    control: form.control,
    name: "payment_splits",
  });

  const cart = useWatch({
    control: form.control,
    name: "cart",
    defaultValue: defaultValues.cart,
  }) as CartSchema["cart"];
  const paymentSplits = useWatch({
    control: form.control,
    name: "payment_splits",
    defaultValue: defaultValues.payment_splits,
  }) as CartSchema["payment_splits"];
  const globalPromotion = useWatch({
    control: form.control,
    name: "global_promotion",
    defaultValue: defaultValues.global_promotion,
  }) as CartSchema["global_promotion"];

  const cartSubtotal = getCartTotal(cart);
  const globalPromotionDiscount = getGlobalPromotionDiscount(
    cartSubtotal,
    globalPromotion,
  );
  const cartTotal = getCartTotalWithGlobalPromotion(cart, globalPromotion);
  const totalPaid = paymentSplits.reduce(
    (sum, split) => sum + (Number(split.amount) || 0),
    0,
  );
  const paymentBalance = getPaymentBalance(totalPaid, cartTotal);

  useEffect(() => {
    if (!autoRecalculateGiftCardSplits) return;
    const nextSplits = recalculatePaymentSplits(paymentSplits, cartTotal);
    if (arePaymentSplitsEqual(paymentSplits, nextSplits)) return;
    form.setValue("payment_splits", nextSplits, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [autoRecalculateGiftCardSplits, cartTotal, form, paymentSplits]);

  const handleScanGiftCard = async () => {
    const barcode = giftCardScanInput.trim();
    if (!barcode) {
      toast.error("Veuillez saisir un code-barres d'avoir");
      return;
    }

    try {
      const response = await getGiftCardByCode(barcode);
      const giftCard = response.data.data;

      if (isGiftCardUnusable(giftCard.status)) {
        toast.error("Cet avoir n'est pas utilisable");
        return;
      }

      const amount = Number(giftCard.current_value ?? 0);

      if (!Number.isFinite(amount) || amount <= 0) {
        toast.error("Aucun solde disponible sur cet avoir");
        return;
      }

      const existingIndex = paymentSplits.findIndex(
        (split) => split.gift_card_barcode === barcode,
      );
      if (existingIndex !== -1) {
        toast.info("Cet avoir est déjà ajouté");
        return;
      }

      appendPayment({
        method: "giftcard",
        amount,
        gift_card_barcode: giftCard.code ?? barcode,
        gift_card_id: giftCard.id,
        gift_card_current_value: giftCard.current_value,
      });
      setGiftCardScanInput("");
      toast.success(`Avoir ajouté: ${formatCurrency(amount)}`);
    } catch (error) {
      const requestError = error as { response?: { status?: number } };
      if (requestError.response?.status === 404) {
        toast.error("Avoir non trouvé");
        return;
      }
      toast.error(getApiErrorMessage(error, "Erreur lors du scan de l'avoir"));
    }
  };

  return {
    form,
    cartFields,
    appendCartItem,
    updateCartItem,
    removeCartItem,
    paymentFields,
    appendPayment,
    removePayment,
    cart,
    paymentSplits,
    globalPromotion,
    cartSubtotal,
    globalPromotionDiscount,
    cartTotal,
    totalPaid,
    paymentBalance,
    giftCardScanInput,
    setGiftCardScanInput,
    handleScanGiftCard,
  };
};
