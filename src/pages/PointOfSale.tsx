import { Container, Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { ActiveSessionInfos } from "../components/ActiveSessionInfos";
import { DialogCloseCaisse } from "../components/DialogCloseCaisse";
import { type Schema as CloseCaisseSchema } from "../components/forms/CloseCaisseForm";
import { ManualItemForm } from "../components/forms/ManualItemForm";
import { CartTable } from "../components/pos/CartTable";
import { CartTabs } from "../components/pos/CartTabs";
import { NoOpenedRegister } from "../components/pos/NoOpenedRegister";
import { OrderSummary } from "../components/pos/OrderSummary";
import { PaymentPanel } from "../components/pos/PaymentPanel";
import { SalesHistory } from "../components/pos/SalesHistory";
import { ScanItem } from "../components/pos/ScanItem";
import { useReceiptPrint } from "../components/ReceiptPrint";
import { useAuth } from "../contexts/AuthContext";
import { usePointOfSale } from "../hooks/usePointOfSale";
import { fetchCategories as fcat } from "../services/api/categories";
import { closeCaisse, getActiveCaisses } from "../services/api/store";
import {
  formatCurrency,
  hasSignificantCashDifference,
  roundCurrency,
} from "../services/cartService";

const PointOfSale = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { triggerPrintReceipt, receiptPrintNode } = useReceiptPrint();
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [manualItemDialog, setManualItemDialog] = useState(false);

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

  const pos = usePointOfSale({
    categories: categories.data,
    activeSession: activeSession.data ?? null,
    user,
    triggerPrintReceipt,
    onManualItemAdded: () => setManualItemDialog(false),
  });

  const closeSession = useMutation({
    mutationFn: (data: { id: number; data: { closing_amount: number } }) =>
      closeCaisse(data.id, data.data),
    onSuccess: (data) => {
      const { difference_amount } = data.data;

      let message = getApiSuccessMessage(data, "Session fermée avec succès");
      if (hasSignificantCashDifference(difference_amount)) {
        message += `\nÉcart: ${difference_amount > 0 ? "+" : ""}${formatCurrency(roundCurrency(difference_amount))}`;
      }

      toast.success(message);
      setCloseSessionDialog(false);
      pos.resetCheckoutForm();
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "Erreur lors de la fermeture de la session"),
      );
    },
  });

  const handleCloseSession = (data: CloseCaisseSchema) => {
    if (activeSession.data) {
      closeSession.mutate({ id: activeSession.data.id, data });
    }
  };

  if (!activeSession.data) {
    return <NoOpenedRegister />;
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
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
        <FormProvider {...pos.form}>
          <form
            id="cartForm"
            onSubmit={pos.form.handleSubmit(pos.handleValidateCart, (err) =>
              console.error(err),
            )}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <ScanItem
                  onManualItem={() => setManualItemDialog(true)}
                  addToCart={pos.addToCart}
                />
                <CartTabs
                  tabValue={pos.tabValue}
                  carts={pos.carts}
                  onChange={pos.changeCart}
                  onAdd={pos.addCart}
                  onRemove={pos.removeCart}
                />
                <CartTable
                  fields={pos.cartFields}
                  update={pos.updateCartItem}
                  remove={pos.removeCartItem}
                />
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <OrderSummary
                  cart={pos.cart}
                  cartSubtotal={pos.cartSubtotal}
                  globalPromotionDiscount={pos.globalPromotionDiscount}
                  paymentBalance={pos.paymentBalance}
                />
                <PaymentPanel
                  paymentFields={pos.paymentFields}
                  appendPayment={pos.appendPayment}
                  removePayment={pos.removePayment}
                  giftCardScanInput={pos.giftCardScanInput}
                  setGiftCardScanInput={pos.setGiftCardScanInput}
                  onScanGiftCard={pos.handleScanGiftCard}
                />
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      )}

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
            onSubmit={pos.handleAddManualItem}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualItemDialog(false)}>Annuler</Button>
          <Button type="submit" form="manualItemForm" variant="contained">
            Ajouter au Panier
          </Button>
        </DialogActions>
      </Dialog>

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
