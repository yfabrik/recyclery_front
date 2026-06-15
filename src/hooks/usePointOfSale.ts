import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import type { Schema as ManualItemSchema } from "../components/forms/ManualItemForm";
import type {
  CashSession,
  CategoryModel,
  LabeledItemModel,
  UserModel,
} from "../interfaces/Models";
import { getGiftCardByCode } from "../services/api/giftCards";
import {
  createSell,
  type CreateTransactionBody,
} from "../services/api/transactions";
import {
  formatCurrency,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  getGlobalPromotionDiscount,
  getPaymentBalance,
  roundCurrency,
  sumPromoCategorie,
} from "../services/cartService";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import type { ReceiptSale } from "../components/admin/SalesAnalyticsTab";
import {
  schema,
  type CartFormValues,
  type CartItem,
  type Schema as CartSchema,
} from "../components/forms/cartSchema";

const defaultFormValues: CartFormValues = {
  cart: [],
  global_promotion: { type: "percent", value: 0 },
  payment_splits: [{ method: "cash", amount: 0 }],
  customer_postal_code: "",
};

interface UsePointOfSaleOptions {
  categories?: CategoryModel[];
  activeSession: CashSession | null;
  user: UserModel | null;
  triggerPrintReceipt: (payload: {
    sale: ReceiptSale;
    items: CartItem[];
    cashSession: CashSession;
    user: UserModel;
    global_promotion: CartSchema["global_promotion"];
  }) => void;
  onManualItemAdded?: () => void;
}

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

export const usePointOfSale = ({
  categories,
  activeSession,
  user,
  triggerPrintReceipt,
  onManualItemAdded,
}: UsePointOfSaleOptions) => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [giftCardScanInput, setGiftCardScanInput] = useState("");
  const [carts, setCarts] = useState<CartSchema["cart"][]>([[]]);

  const form = useForm<CartFormValues, unknown, CartSchema>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(schema),
  });

  const {
    fields: cartFields,
    append,
    update,
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
    defaultValue: [],
  }) as CartSchema["cart"];
  const paymentSplits = useWatch({
    control: form.control,
    name: "payment_splits",
    defaultValue: [{ method: "cash", amount: 0 }],
  }) as CartSchema["payment_splits"];
  const globalPromotion = useWatch({
    control: form.control,
    name: "global_promotion",
    defaultValue: { type: "percent", value: 0 },
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
    const nextSplits = recalculatePaymentSplits(paymentSplits, cartTotal);
    if (arePaymentSplitsEqual(paymentSplits, nextSplits)) return;
    form.setValue("payment_splits", nextSplits, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [cartTotal, form, paymentSplits]);

  const resetPaymentFields = () => ({
    global_promotion: defaultFormValues.global_promotion,
    payment_splits: defaultFormValues.payment_splits,
    customer_postal_code: defaultFormValues.customer_postal_code,
  });

  const resetCheckoutForm = () => {
    form.reset(defaultFormValues);
    setCarts([[]]);
    setTabValue(0);
  };

  const completeCurrentCartAfterSale = () => {
    const nextCarts = carts.filter((_, index) => index !== tabValue);

    if (nextCarts.length === 0) {
      setCarts([[]]);
      setTabValue(0);
      form.reset(defaultFormValues);
      return;
    }

    const newTabValue = Math.min(tabValue, nextCarts.length - 1);
    setCarts(nextCarts);
    setTabValue(newTabValue);
    form.reset(
      {
        cart: (nextCarts[newTabValue] ?? []).map((item) => ({ ...item })),
        ...resetPaymentFields(),
      },
      { keepDefaultValues: true },
    );
  };

  const getCurrentCartSnapshot = () => (cart ?? []).map((item) => ({ ...item }));

  const addCart = () => {
    const currentCart = getCurrentCartSnapshot();
    const newTabIndex = carts.length;
    const nextCarts = [...carts];
    nextCarts[tabValue] = currentCart;
    nextCarts.push([] as CartSchema["cart"]);
    setCarts(nextCarts);
    setTabValue(newTabIndex);
    form.reset({ ...form.getValues(), cart: [] }, { keepDefaultValues: true });
  };

  const removeCart = (index: number) => {
    if (carts.length <= 1) return;
    const currentCart = getCurrentCartSnapshot();
    const nextCarts = carts
      .map((c, i) => (i === tabValue ? currentCart : c))
      .filter((_, i) => i !== index);
    const newTabValue =
      index === tabValue
        ? Math.min(index, nextCarts.length - 1)
        : index < tabValue
          ? tabValue - 1
          : tabValue;
    setCarts(nextCarts);
    setTabValue(newTabValue);
    form.reset(
      {
        ...form.getValues(),
        cart: (nextCarts[newTabValue] ?? []).map((item) => ({ ...item })),
      },
      { keepDefaultValues: true },
    );
  };

  const changeCart = (newIndex: number) => {
    if (newIndex === tabValue) return;
    const currentCart = getCurrentCartSnapshot();
    const nextCarts = [...carts];
    nextCarts[tabValue] = currentCart;
    setCarts(nextCarts);
    setTabValue(newIndex);
    form.reset(
      {
        ...form.getValues(),
        cart: (nextCarts[newIndex] ?? []).map((item) => ({ ...item })),
      },
      { keepDefaultValues: true },
    );
  };

  const isLabeledItem = (
    item: ManualItemSchema | LabeledItemModel,
  ): item is LabeledItemModel => "barcode" in item;

  const handleitem = (item: ManualItemSchema | LabeledItemModel) => {
    const barcode = isLabeledItem(item) ? item.barcode : `MANUAL${Date.now()}`;

    const selectedCategory = categories?.find(
      (cat) => cat.id == item.category_id,
    );
    const selectedSubcategory = selectedCategory?.subcategories?.find(
      (cat) => cat.id == item.subcategory_id,
    );

    let itemName = selectedCategory?.name || "Article";
    if (selectedSubcategory) {
      itemName += `(${selectedSubcategory.name})`;
    }

    const source = selectedSubcategory ?? selectedCategory;
    if (source?.priceBasedOnWeight) item.price = item.price * item.weight;

    const promotion = !isLabeledItem(item)
      ? item.promotion
      : sumPromoCategorie(selectedCategory) +
        sumPromoCategorie(selectedSubcategory);

    return {
      barcode,
      category_id: item.category_id,
      subcategory_id: item.subcategory_id,
      name: itemName,
      description: item.description || "",
      category_name: selectedCategory?.name || "",
      subcategory_name: selectedSubcategory?.name || "",
      price: item.price,
      weight: item.weight,
      quantity: 1,
      promotion,
      bundlePrice: source?.bundlePrice,
      bundleQuantity: source?.bundleQuantity,
      priceBasedOnWeight: source?.priceBasedOnWeight ?? false,
    } satisfies CartItem & { priceBasedOnWeight: boolean };
  };

  const addToCart = (item: LabeledItemModel): boolean => {
    const currentCart = form.getValues("cart");
    const existingItem = currentCart.findIndex(
      (cartItem) => cartItem.barcode === item.barcode,
    );

    if (existingItem !== -1) {
      update(existingItem, {
        ...currentCart[existingItem],
        quantity: currentCart[existingItem].quantity + 1,
      });
    } else {
      append(handleitem(item));
    }

    return true;
  };

  const handleAddManualItem = (data: ManualItemSchema) => {
    const manualItem = handleitem(data);
    append(manualItem);
    onManualItemAdded?.();
    toast.success(`${manualItem.name} ajouté au panier`);
  };

  const handleScanGiftCard = async () => {
    const barcode = giftCardScanInput.trim();
    if (!barcode) {
      toast.error("Veuillez saisir un code-barres d'avoir");
      return;
    }

    try {
      const response = await getGiftCardByCode(barcode);
      const payload = response.data;
      if (!payload.success) {
        toast.error(payload.message || "Avoir non trouvé");
        return;
      }
      const giftCard = payload.data;

      if (["redeemed", "expired", "cancelled"].includes(giftCard.status)) {
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

  const handleSell = useMutation({
    mutationFn: (data: CreateTransactionBody) => createSell(data),
    onSuccess: (data) => {
      toast.success(
        getApiSuccessMessage(data, "Vente enregistrée avec succès"),
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });

      const soldItems = form.getValues("cart") as CartItem[];
      const soldGlobalPromotion = form.getValues(
        "global_promotion",
      ) as CartSchema["global_promotion"];

      if (window.confirm("Imprimer le ticket de caisse ?")) {
        if (activeSession && user) {
          const saleWithSplitPayments = {
            ...data.data.data.sale,
            payments: data.data.data.payments,
          } as ReceiptSale;
          triggerPrintReceipt({
            sale: saleWithSplitPayments,
            items: soldItems,
            cashSession: activeSession,
            user,
            global_promotion: soldGlobalPromotion,
          });
        }
      }
      completeCurrentCartAfterSale();
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de l'enregistrement de la vente"),
      );
    },
  });

  const handleValidateCart = (data: CartSchema) => {
    const subtotal = getCartTotal(data.cart);
    const total = getCartTotalWithGlobalPromotion(
      data.cart,
      data.global_promotion,
    );
    const paymentAmount = data.payment_splits.reduce(
      (sum, split) => sum + (Number(split.amount) || 0),
      0,
    );
    const nonZeroSplits = data.payment_splits.filter(
      (split) => Number(split.amount) > 0,
    );

    if (activeSession) {
      const transactionData = {
        cash_session_id: activeSession.id,
        total_amount: roundCurrency(total),
        total_amount_before_promotion: roundCurrency(subtotal),
        global_promotion: Number(data.global_promotion.value) || 0,
        global_promotion_type: data.global_promotion.type,
        payment_amount: roundCurrency(paymentAmount),
        customer_postal_code: data.customer_postal_code,
        payments: nonZeroSplits.map((split) => ({
          method: split.method,
          amount: Number(split.amount) || 0,
          gift_card_code: split.gift_card_barcode,
        })),
        items: data.cart.map((item) => ({
          ...item,
          total_price: item.quantity * item.price,
        })),
      } satisfies CreateTransactionBody;
      handleSell.mutate(transactionData);
    }
  };

  return {
    form,
    cart,
    cartFields,
    cartSubtotal,
    globalPromotionDiscount,
    cartTotal,
    totalPaid,
    paymentBalance,
    paymentFields,
    tabValue,
    carts,
    addCart,
    removeCart,
    changeCart,
    addToCart,
    updateCartItem: update,
    removeCartItem,
    appendPayment,
    removePayment,
    handleAddManualItem,
    giftCardScanInput,
    setGiftCardScanInput,
    handleScanGiftCard,
    handleValidateCart,
    resetCheckoutForm,
  };
};
