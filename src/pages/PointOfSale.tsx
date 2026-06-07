import { zodResolver } from "@hookform/resolvers/zod";
import {
  Add,
  Backpack,
  Close,
  Euro,
  Loyalty,
  Payment,
  QrCodeScanner,
  Remove,
  ShoppingCart,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { ActiveSessionInfos } from "../components/ActiveSessionInfos";
import type { ReceiptSale } from "../components/admin/SalesAnalyticsTab";
import { DialogCloseCaisse } from "../components/DialogCloseCaisse";
import {
  schema,
  type CartItem,
  type Schema as CartSchema,
} from "../components/forms/cartSchema";
import { type Schema as CloseCaisseSchema } from "../components/forms/CloseCaisseForm";
import { FormInput, FormSelect } from "../components/forms/FormBase";
import {
  ManualItemForm,
  type Schema as ManualItemSchema,
} from "../components/forms/ManualItemForm";
import { NoOpenedRegister } from "../components/pos/NoOpenedRegister";
import { SalesHistory } from "../components/pos/SalesHistory";
import { useReceiptPrint } from "../components/ReceiptPrint";
import { useAuth } from "../contexts/AuthContext";
import type { LabeledItemModel } from "../interfaces/Models";
import { fetchCategories as fcat } from "../services/api/categories";
import { getGiftCardByCode } from "../services/api/giftCards";
import { getItemFromBarcode } from "../services/api/labeledItems";
import { closeCaisse, getActiveCaisses } from "../services/api/store";

import { createSell, type CreateTransactionBody } from "../services/api/transactions";
import {
  formatCurrency,
  formatWeight,
  getCartLinePrice,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  getGlobalPromotionDiscount,
  getPaymentBalance,
  hasSignificantCashDifference,
  isPaymentInsufficient,
  roundCurrency,
  sumPromoCategorie,
} from "../services/cartService";

const PointOfSale = () => {
  const { user } = useAuth();
  const { triggerPrintReceipt, receiptPrintNode } = useReceiptPrint();
  const [tabValue, setTabValue] = useState(0);
  // Dialogs
  // const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  // const [paymentDialog, setPaymentDialog] = useState(false);
  const [manualItemDialog, setManualItemDialog] = useState(false);

  const [scanInput, setScanInput] = useState("");
  const [giftCardScanInput, setGiftCardScanInput] = useState("");

  //TODO ? set type here so no unknow and so no need to put as CartShema after ? ? but resolver dont like it
  // const form = useForm<CartSchema>({
  const form = useForm({
    defaultValues: {
      cart: [],
      global_promotion: { type: "percent", value: 0 },
      payment_splits: [{ method: "cash", amount: 0 }],
      customer_postal_code: "",
    },
    resolver: zodResolver(schema),
  });

  const {
    fields: cartFields,
    append,
    remove,
    update,
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

  /** Typed as CartItem[] so item fields (e.g. subcategory_id) are not inferred as unknown from empty defaultValues. */
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
  const globalPromotionDiscount = getGlobalPromotionDiscount(cartSubtotal, globalPromotion);
  const cartTotal = getCartTotalWithGlobalPromotion(cart, globalPromotion);
  const totalPaid = paymentSplits.reduce((sum, split) => sum + (Number(split.amount) || 0), 0);
  const paymentBalance = getPaymentBalance(totalPaid, cartTotal);
  const [carts, setCarts] = useState<CartSchema["cart"][]>([[]]);

  const recalculatePaymentSplits = (
    currentSplits: CartSchema["payment_splits"],
    total: number,
  ): CartSchema["payment_splits"] => {
    let remainingForGiftCards = total;
    const nextSplits = currentSplits.map((split) => {
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

    // return nextSplits.map((split, index) => {
    //   if (split.method !== "card" && split.method !== "check") {
    //     return split;
    //   }

    //   const paidByOtherSplits = nextSplits.reduce((sum, current, currentIndex) => {
    //     if (currentIndex === index) return sum;
    //     return sum + (Number(current.amount) || 0);
    //   }, 0);

    //   return {
    //     ...split,
    //     amount: Math.max(total - paidByOtherSplits, 0),
    //   };
    // });
    return nextSplits;
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

  useEffect(() => {
    const nextSplits = recalculatePaymentSplits(paymentSplits, cartTotal);
    if (arePaymentSplitsEqual(paymentSplits, nextSplits)) return;
    form.setValue("payment_splits", nextSplits, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [cartTotal, form, paymentSplits]);

  const getCurrentCartSnapshot = () =>
    (cart ?? []).map((item) => ({ ...item }));

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
  const queryClient = useQueryClient();

  const activeSession = useQuery({
    queryKey: ["activeSession"],
    queryFn: () =>
      getActiveCaisses().then((response) => response.data?.session ?? null),
  });

  const categories = useQuery({
    queryKey: [
      "categories",
      {
        include: ["category", "promo"],
        only_category: true,
        sell: true,
        store_id: activeSession.data?.CashRegister?.recyclery_id,
      },
    ],
    queryFn: () =>
      fcat({
        include: ["category", "promo"],
        only_category: true,
        sell: true,
        store_id: activeSession.data?.CashRegister?.recyclery_id,
      }).then((response) => response.data.categories),
  });

  // const openSession = useMutation({
  //   mutationFn: (data: {
  //     store_id: number;
  //     opening_amount: number;
  //     cash_register_id: number;
  //   }) => OpenCaisse(data),
  //   onSuccess: (data) => {
  //     toast.success("Session ouverte avec succès");
  //     setOpenSessionDialog(false);
  //     queryClient.invalidateQueries({ queryKey: ["activeSession"] });
  //   },
  //   onError: (error) => {
  //     toast.error("Erreur lors de l'ouverture");
  //   },
  // });
  const closeSession = useMutation({
    mutationFn: (data: { id: number; data: { closing_amount: number } }) =>
      closeCaisse(data.id, data.data),
    onSuccess: (data) => {
      console.log("closeSession success", data);
      const { difference_amount } = data.data;

      let message = "Session fermée avec succès";
      if (hasSignificantCashDifference(difference_amount)) {
        message += `\nÉcart: ${difference_amount > 0 ? "+" : ""}${formatCurrency(roundCurrency(difference_amount))}`;
      }

      toast.success(message);
      setCloseSessionDialog(false);
      form.reset({
        cart: [],
        global_promotion: { type: "percent", value: 0 },
        payment_splits: [{ method: "cash", amount: 0 }],
        customer_postal_code: "",
      });
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
    onError: () => {
      toast.error("Erreur lors de la fermeture de la session");
    },
  });

  // const handleOpenSession = (data: OpenCaisseSchema) => {
  //   openSession.mutate(data);
  // };
  const handleCloseSession = (data: CloseCaisseSchema) => {
    if (activeSession.data)
      //TODO faire sans ou raise error ??? use type never ?
      closeSession.mutate({ id: activeSession.data.id, data: data });
  };
  const handleSell = useMutation({
    mutationFn: (data: CreateTransactionBody) => createSell(data),
    onSuccess: (data) => {
      toast.success("Vente enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // setPaymentDialog(false);
      // setPaymentData({
      //   payment_method: "cash",
      //   payment_amount: "0",
      //   customer_name: "",
      //   customer_email: "",
      // });
      if (window.confirm("Imprimer le ticket de caisse ?")) {
        if (activeSession.data) {
          const saleWithSplitPayments = {
            ...data.data.data.sale,
            payments: data.data.data.payments,
          } as ReceiptSale;
          triggerPrintReceipt({
            sale: saleWithSplitPayments,
            items: cart as CartItem[],
            cashSession: activeSession.data,
            user: user!,
            global_promotion: globalPromotion,
          });
        }
      }
      form.reset({
        cart: [],
        global_promotion: { type: "percent", value: 0 },
        payment_splits: [{ method: "cash", amount: 0 }],
        customer_postal_code: "",
      });
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de la vente");
    },
  });

  const isLabeledItem = (
    item: ManualItemSchema | LabeledItemModel,
  ): item is LabeledItemModel => {
    return "barcode" in item;
  };
  const handleitem = (item: ManualItemSchema | LabeledItemModel) => {
    const barcode = isLabeledItem(item) ? item.barcode : `MANUAL${Date.now()}`;

    const selectedCategory = categories.data?.find(
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

  const handleScanProduct = async () => {
    if (!scanInput.trim()) {
      toast.error("Veuillez saisir un code-barres");
      return;
    }

    try {
      const response = await getItemFromBarcode(scanInput);
      const item = response.data.item;

      if (item.status !== "available") {
        toast.error("Cet article n'est pas disponible à la vente");
        return;
      }

      // Ajouter au panier
      const existingItem = cart.findIndex(
        (cartItem) => cartItem.barcode === item.barcode,
      );

      if (existingItem !== -1) {
        update(existingItem, {
          ...cart[existingItem],
          quantity: cart[existingItem].quantity + 1,
        });
      } else {
        const currentItem = handleitem(item);

        append(currentItem);
      }

      setScanInput("");
      toast.success(`${item.barcode} ajouté au panier`);
    } catch (error) {
      const requestError = error as { response?: { status?: number } };
      if (requestError.response?.status === 404) {
        toast.error("Article non trouvé");
      } else {
        toast.error("Erreur lors du scan");
      }
    }
  };

  const handleAddManualItem = (data: ManualItemSchema) => {
    const manualItem = handleitem(data);

    append(manualItem);

    setManualItemDialog(false);
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

      const amountCandidate = giftCard.current_value;
      const amount = Number(amountCandidate ?? 0);

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
      toast.error("Erreur lors du scan de l'avoir");
    }
  };

  const handleValidateCart = async (data: CartSchema) => {

    const subtotal = getCartTotal(data.cart);
    const total = getCartTotalWithGlobalPromotion(data.cart, data.global_promotion);
    const paymentAmount = data.payment_splits.reduce(
      (sum, split) => sum + (Number(split.amount) || 0),
      0,
    );
    const nonZeroSplits = data.payment_splits.filter(
      (split) => Number(split.amount) > 0,
    );
    // const primaryPayment = nonZeroSplits[0] ?? data.payment_splits[0];

    if (activeSession.data) {
      const transactionData = {
        cash_session_id: activeSession.data.id,
        //TODO drop the rounded & make the api handle the rounding
        total_amount: roundCurrency(total),
        total_amount_before_promotion: roundCurrency(subtotal),
        global_promotion: Number(data.global_promotion.value) || 0,
        global_promotion_type: data.global_promotion.type,
        // payment_method: primaryPayment.method,//TODO remove
        payment_amount: roundCurrency(paymentAmount),
        customer_postal_code: data.customer_postal_code,
        payments: nonZeroSplits.map((split) => ({
          method: split.method,
          amount: Number(split.amount) || 0,
          gift_card_code: split.gift_card_barcode,
        })),
        // payment_splits: nonZeroSplits.map((split) => ({
        //   method: split.method,
        //   amount: Number(split.amount) || 0,
        // })),

        items: data.cart.map((item) => ({
          ...item,
          total_price: item.quantity * item.price,
        })),
      } satisfies CreateTransactionBody;
      handleSell.mutate(transactionData);

    }
  };

  if (!activeSession.data) {
    return <NoOpenedRegister />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* En-tête de session */}
      <ActiveSessionInfos
        activeSession={activeSession.data}
        setCloseSessionDialog={setCloseSessionDialog}
        showTransactionHistory={showTransactionHistory}
        toggleTransactionHistory={() =>
          setShowTransactionHistory((prev) => !prev)
        }
      />

      {showTransactionHistory ? (
        <SalesHistory activeSession={activeSession.data} />
      ) : (
        <form
          id="cartForm"
          onSubmit={form.handleSubmit(handleValidateCart, (err) =>
            console.error(err),
          )}
        >
          <Grid container spacing={2}>
            {/* Scanner et panier */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Scanner */}
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Ajouter Article
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    placeholder="Scanner ou saisir le code-barres..."
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleScanProduct()}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <QrCodeScanner
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleScanProduct}
                    sx={{ minWidth: 100 }}
                    disabled={scanInput.length < 1}
                  >
                    Scanner
                  </Button>
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setManualItemDialog(true)}
                    sx={{ minWidth: 200 }}
                  >
                    Article Manuel
                  </Button>
                </Box>
              </Paper>
              <Tabs
                value={tabValue}
                onChange={(_, val) => changeCart(val as number)}
              >
                {carts.map((_, index) => (
                  <Tab
                    key={index}
                    label={
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        Panier {index + 1}
                        <Box
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCart(index);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              e.stopPropagation();
                              removeCart(index);
                            }
                          }}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            color:
                              carts.length <= 1 ? "action.disabled" : "inherit",
                            cursor: carts.length <= 1 ? "default" : "pointer",
                            "&:hover": {
                              bgcolor:
                                carts.length <= 1
                                  ? "transparent"
                                  : "action.hover",
                            },
                          }}
                          aria-disabled={carts.length <= 1}
                        >
                          <Close fontSize="small" />
                        </Box>
                      </Box>
                    }
                  />
                ))}
                <Tab
                  icon={<Add />}
                  aria-label="Ajouter un panier"
                  onClick={(e) => {
                    e.preventDefault();
                    addCart();
                  }}
                />
              </Tabs>
              {/* Panier */}
              {/* <form id="cartForm" onSubmit={form.handleSubmit(handleValidateCart)}> */}
              <Paper sx={{ p: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <ShoppingCart />
                  Panier ({cartFields.length} article
                  {cartFields.length > 1 ? "s" : ""})
                </Typography>

                {cartFields.length === 0 ? (
                  <Alert severity="info">
                    Le panier est vide. Scannez des articles pour commencer.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Article</TableCell>
                          <TableCell>Poids unitaire</TableCell>
                          <TableCell>Prix unitaire</TableCell>
                          <TableCell>Quantité</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cartFields.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                  >
                                    {item.name}
                                  </Typography>
                                  {isNaN(+item.barcode) && (
                                    <Chip
                                      size="small"
                                      label="Manuel"
                                      color="info"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  {item.barcode}
                                </Typography>
                                {(item.category_name ||
                                  item.subcategory_name) && (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {item.category_name}
                                    {item.subcategory_name &&
                                      ` > ${item.subcategory_name}`}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>{formatWeight(item.weight)}</TableCell>
                            <TableCell>
                              {formatCurrency(item.price)}
                              {item.promotion != 0 && (
                                <Chip
                                  color="secondary"
                                  icon={<Loyalty />}
                                  sx={{
                                    marginLeft: 1,
                                  }}
                                  label={`-${item.promotion}%`}
                                  size="small"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    return item.quantity - 1 <= 0
                                      ? remove(index)
                                      : update(index, {
                                          ...item,
                                          quantity: item.quantity - 1,
                                        });
                                  }}
                                >
                                  <Remove />
                                </IconButton>
                                <Typography
                                  sx={{ minWidth: 30, textAlign: "center" }}
                                >
                                  {item.quantity}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    update(index, {
                                      ...item,
                                      quantity: item.quantity + 1,
                                    })
                                  }
                                >
                                  <Add />
                                </IconButton>
                                {item.bundleQuantity &&
                                  item.bundleQuantity != 0 &&
                                  item.bundleQuantity != 1 &&
                                  item.quantity >= item.bundleQuantity && (
                                    <Chip
                                      color="secondary"
                                      icon={<Backpack />}
                                      sx={{
                                        marginLeft: 1,
                                      }}
                                      label={`${Math.trunc(item.quantity / item.bundleQuantity)} pack`}
                                      size="small"
                                    />
                                  )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography fontWeight="bold">
                                {
                                  formatCurrency(
                                    getCartLinePrice(item as CartItem),
                                  ) /*FIXME  as cartItem devrait pas etre la */
                                }
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => remove(index)}
                              >
                                <Close />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
              {/* </form> */}
            </Grid>

            {/* Résumé et paiement */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 2, /* position: "sticky",*/ top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Résumé de la Commande
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Types d'articles:</Typography>
                  <Typography>{cart.length}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Total d'articles:</Typography>
                  <Typography>
                    {cart.reduce(
                      (prev, current) => (prev += current.quantity),
                      0,
                    )}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Poids</Typography>
                  <Typography>
                    {
                    formatWeight(cart.reduce(
                      (prev, current) =>
                        (prev += current.weight * current.quantity),
                        0,
                      )
                    )}{" "}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography>Sous-total:</Typography>
                  <Typography>{formatCurrency(cartSubtotal)}</Typography>
                </Box>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
                >
                  <Typography>Promotion globale:</Typography>
                  <Typography color={globalPromotionDiscount > 0 ? "success.main" : "text.primary"}>
                    -{formatCurrency(globalPromotionDiscount)}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total à payer:</Typography>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                    {formatCurrency(paymentBalance.due)}
                  </Typography>
                </Box>
                {/* 
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Payment />}
              // type="submit"
              // form="cartForm"
              onClick={() => {
                setPaymentData((prev) => ({
                  ...prev,
                  payment_amount: getCartTotal().toString(),
                }));
                setPaymentDialog(true);
              }}
              disabled={cart.length === 0}
              sx={{ mb: 2 }}
            >
              Encaisser
            </Button> */}
              </Paper>

              <Paper sx={{ p: 2, mt: 2 }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Gift Card / Avoir
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Scanner ou saisir le code-barres de l'avoir..."
                        value={giftCardScanInput}
                        onChange={(e) => setGiftCardScanInput(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleScanGiftCard()
                        } //FIXME y'a pas conflict avec scan item ?
                        slotProps={{
                          input: {
                            startAdornment: (
                              <QrCodeScanner
                                sx={{ mr: 1, color: "text.secondary" }}
                              />
                            ),
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        size="small"
                        type="button"
                        onClick={handleScanGiftCard}
                        sx={{ minWidth: 96 }}
                        disabled={giftCardScanInput.trim().length < 1}
                      >
                        Scanner
                      </Button>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="subtitle2">Paiements</Typography>
                    </Box>
                  </Grid>
                  

                  {paymentFields.map((payment, index) => (
                    <Grid key={payment.id} size={{ xs: 12 }}>
                      {paymentSplits[index]?.method === "giftcard" && (
                        <Box sx={{ mb: 1 }}>
                          <Chip
                            size="small"
                            color="secondary"
                            label={`Avoir: ${paymentSplits[index]?.gift_card_barcode ?? "N/A"} - ${formatCurrency(Number(paymentSplits[index]?.gift_card_current_value || 0))}`}
                          />
                        </Box>
                      )}
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <Box sx={{ width: "42%" }}>
                          <FormSelect
                            label={`Mode de paiement #${index + 1}`}
                            control={form.control}
                            name={`payment_splits.${index}.method`}
                            extraSelect={{
                              size: "small",
                              disabled:
                                paymentSplits[index]?.method === "giftcard",
                            }}
                          >
                            <MenuItem value="cash">Espèces</MenuItem>
                            <MenuItem value="card">Carte bancaire</MenuItem>
                            <MenuItem value="check">Chèque</MenuItem>
                            <MenuItem value="transfer">Virement</MenuItem>
                            <MenuItem value="giftcard" disabled>
                              Avoir
                            </MenuItem>
                          </FormSelect>
                        </Box>
                        <Box sx={{ width: "42%" }}>
                          <FormInput
                            label="Montant (€)"
                            control={form.control}
                            name={`payment_splits.${index}.amount`}
                            extra={{
                              type: "number",
                              size: "small",
                              disabled:
                                paymentSplits[index]?.method === "giftcard",
                              slotProps: {
                                input: {
                                  startAdornment: (
                                    <Euro
                                      sx={{ mr: 1, color: "text.secondary" }}
                                    />
                                  ),
                                },
                              },
                            }}
                          />
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => removePayment(index)}
                          disabled={paymentFields.length <= 1}
                          sx={{ mt: 0.5 }}
                          size="small"
                        >
                          <Close />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  <Grid size={{ xs: 12 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        appendPayment({
                          method: "cash",
                          amount: 0,
                          gift_card_barcode: undefined,
                          gift_card_id: undefined,
                        })
                      }
                    >
                      + payment
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 10 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Promotion globale panier
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Box sx={{ width: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
                          <Typography variant="body2">% </Typography>
                          <Switch
                            checked={globalPromotion.type === "fixed"}
                            onChange={(_, checked) =>
                              form.setValue(
                                "global_promotion.type",
                                checked ? "fixed" : "percent",
                                { shouldDirty: true, shouldValidate: true },
                              )}
                            size="small"
                          />
                          <Typography variant="body2">€</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ width: "50%" }}>
                        <FormInput
                          label="Valeur"
                          control={form.control}
                          name="global_promotion.value"
                          extra={{
                            type: "number",
                            size: "small",
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  {paymentBalance.change > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info">
                        Rendu à donner: {formatCurrency(paymentBalance.change)}
                      </Alert>
                    </Grid>
                  )}
                  {paymentBalance.remaining > 0 && cart.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="warning">
                        Reste à payer: {formatCurrency(paymentBalance.remaining)}
                      </Alert>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total payé: {formatCurrency(paymentBalance.paid)} /{" "}
                      {formatCurrency(paymentBalance.due)}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormInput
                      control={form.control}
                      label="Code Postal"
                      name="customer_postal_code"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}></Grid>
                </Grid>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  startIcon={<Payment />}
                  type="submit"
                  disabled={
                    cart.length === 0 ||
                    isPaymentInsufficient(totalPaid, cartTotal)
                  }
                  sx={{ mb: 2 }}
                >
                  Encaisser
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </form>
      )}
      {/* Dialog d'article manuel */}
      <Dialog
        open={manualItemDialog}
        onClose={() => setManualItemDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ajouter un Article Manuel</DialogTitle>
        <DialogContent>
          <ManualItemForm
            formId="manualItemForm"
            categories={categories.data || []}
            onSubmit={handleAddManualItem}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualItemDialog(false)}>Annuler</Button>
          <Button
            type="submit"
            form="manualItemForm"
            variant="contained"
            // disabled={!manualItemData.category_id || !manualItemData.price}
          >
            Ajouter au Panier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de fermeture de session */}
      <DialogCloseCaisse
        closeSessionDialog={closeSessionDialog}
        setCloseSessionDialog={setCloseSessionDialog}
        currentSession={activeSession.data}
        handleCloseSession={handleCloseSession}
      />
      {receiptPrintNode}
    </Container>
  );
};

export default PointOfSale;
