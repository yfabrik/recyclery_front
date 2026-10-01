import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  type CartFormValues,
  type CartItem,
  type CartFormOutput as CartSchema,
} from "../services/schema/cart";
import type {
  CashSession,
  CategoryModel,
  LabeledItemModel,
  AuthUserModel,
} from "../interfaces/Models";
import {
  createSell,
} from "../services/api/transactions";
import {
  sumPromoCategorie,
} from "../services/cartService";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { buildTransactionBody } from "../services/mapper/cart";
import type {
  ReceiptPrintTrigger,
  ReceiptSale,
} from "../utils/transactionReceipt";
import { useCheckoutFormCore } from "./useCheckoutFormCore";
import { manualItemPayloadFromForm } from "../services/mapper/label";
import type { ManualItemFormOutput as ManualItemSchema } from "../services/schema/item";
import type { SaleTransactionBaseInput } from "@recyclerie/api/schemas/salesTransactions";
import {
  clearPosCartDraft,
  readPosCartDraft,
  snapshotPosCarts,
  writePosCartDraft,
} from "../utils/posCartStorage";

const defaultFormValues: CartFormValues = {
  cart: [],
  global_promotion: { type: "percent", value: 0 },
  payment_splits: [{ method: "cash", amount: 0 }],
  customer_postal_code: "",
};

interface UsePointOfSaleOptions {
  categories?: CategoryModel[];
  activeSession: CashSession | null;
  user: AuthUserModel | null;
  triggerPrintReceipt: ReceiptPrintTrigger;
  onManualItemAdded?: () => void;
}

export const usePointOfSale = ({
  categories,
  activeSession,
  user,
  triggerPrintReceipt,
  onManualItemAdded,
}: UsePointOfSaleOptions) => {
  const queryClient = useQueryClient();
  const sessionId = activeSession?.id ?? null;
  const [initialDraft] = useState(() =>
    sessionId != null ? readPosCartDraft(sessionId) : null,
  );
  const [tabValue, setTabValue] = useState(() => initialDraft?.tabValue ?? 0);
  const [carts, setCarts] = useState<CartItem[][]>(
    () => initialDraft?.carts ?? [[]],
  );
  const [hydratedSessionId, setHydratedSessionId] = useState<number | null>(
    () => sessionId,
  );
  const previousSessionIdRef = useRef(sessionId);

  const {
    form,
    cartFields,
    appendCartItem: append,
    updateCartItem: update,
    removeCartItem,
    paymentFields,
    appendPayment,
    removePayment,
    cart,
    cartSubtotal,
    globalPromotionDiscount,
    cartTotal,
    totalPaid,
    paymentBalance,
    giftCardScanInput,
    setGiftCardScanInput,
    handleScanGiftCard,
  } = useCheckoutFormCore({
    defaultValues: {
      ...defaultFormValues,
      cart: initialDraft?.carts[initialDraft.tabValue] ?? [],
    },
    autoRecalculateGiftCardSplits: true,
  });

  if (sessionId !== hydratedSessionId) {
    setHydratedSessionId(sessionId);
    const stored = sessionId != null ? readPosCartDraft(sessionId) : null;
    if (stored) {
      setCarts(stored.carts);
      setTabValue(stored.tabValue);
    } else {
      setCarts([[]]);
      setTabValue(0);
    }
  }

  const resetPaymentFields = () => ({
    global_promotion: defaultFormValues.global_promotion,
    payment_splits: defaultFormValues.payment_splits,
    customer_postal_code: defaultFormValues.customer_postal_code,
  });

  const resetCheckoutForm = () => {
    form.reset(defaultFormValues);
    setCarts([[]]);
    setTabValue(0);
    clearPosCartDraft();
  };

  useEffect(() => {
    if (previousSessionIdRef.current === sessionId) return;
    previousSessionIdRef.current = sessionId;

    if (sessionId == null) {
      form.reset(defaultFormValues);
      return;
    }

    const stored = readPosCartDraft(sessionId);
    form.reset({
      ...defaultFormValues,
      cart: stored?.carts[stored.tabValue] ?? [],
    });
  }, [form, sessionId]);

  useEffect(() => {
    if (sessionId == null || hydratedSessionId !== sessionId) return;
    const currentCart = cart ?? form.getValues("cart");
    writePosCartDraft(sessionId, {
      tabValue,
      carts: snapshotPosCarts(carts, tabValue, currentCart),
    });
  }, [cart, carts, form, hydratedSessionId, sessionId, tabValue]);

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
    const barcode =
      (isLabeledItem(item) ? item.barcode : undefined) ?? `MANUAL${Date.now()}`;

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
      ? item.promotion === ""
        ? 0
        : item.promotion
      : sumPromoCategorie(selectedCategory) +
        sumPromoCategorie(selectedSubcategory);

    return {
      barcode,
      category_id:
        typeof item.category_id === "number" ? item.category_id : Number(item.category_id),
      subcategory_id:
        item.subcategory_id === "" || item.subcategory_id == null
          ? null
          : item.subcategory_id,
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
    const mapped = manualItemPayloadFromForm(data);
    const manualItem = handleitem({
      category_id: mapped.category_id,
      subcategory_id: mapped.subcategory_id ?? "",
      weight: mapped.weight,
      price: mapped.price,
      description: mapped.description ?? "",
      promotion: mapped.promotion,
    });
    append(manualItem);
    onManualItemAdded?.();
    toast.success(`${manualItem.name} ajouté au panier`);
  };

  const handleSell = useMutation({
    mutationFn: (data: SaleTransactionBaseInput) => createSell(data),
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
            ...data.data.data.transaction,
            payments: data.data.data.transaction.payments ?? [],
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

  const cartPayloadToApi = (data: CartSchema): SaleTransactionBaseInput => {
    return buildTransactionBody(data, activeSession!.id, {
      normalizePostalCodeToNull: false,
      includeTotalPrice: true,
    })
  }
  const handleValidateCart = (data: CartSchema) => {
    if (activeSession) {
      handleSell.mutate(cartPayloadToApi(data));
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
