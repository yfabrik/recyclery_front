import { Box, Grid } from "@mui/material";
import { FormProvider, type FieldErrors } from "react-hook-form";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import { useTransactionRefunds } from "../../hooks/useTransactionRefunds";
import { buildTransactionCartFormValues } from "../../utils/editTransactionDefaults";
import { CartTable } from "../pos/CartTable";
import { OrderSummary } from "../pos/OrderSummary";
import { PaymentPanel } from "../pos/PaymentPanel";
import { RefundHistoryCard } from "./RefundHistoryCard";
import { TransactionFinancialSummaryCard } from "./TransactionFinancialSummaryCard";
import { TransactionInfoCard } from "./TransactionInfoCard";
import { type CartFormValues, type Schema } from "../forms/cartSchema";
import { useCheckoutFormCore } from "../../hooks/useCheckoutFormCore";
import { toast } from "react-toastify";
import { collectFormErrorMessages } from "../../utils/formErrors";

interface TransactionDetailsContentProps {
  transaction: TransactionModel;
  categories: CategoryModel[];
  editable: boolean;
  formId: string;
  onSubmit?: (data: Schema) => void;
}

export const TransactionDetailsContent = ({
  transaction,
  categories,
  editable,
  formId,
  onSubmit,
}: TransactionDetailsContentProps) => {
  const resolvedDefaults = buildTransactionCartFormValues(transaction, categories);
  const {
    form,
    cartFields,
    updateCartItem,
    removeCartItem,
    paymentFields,
    appendPayment,
    removePayment,
    cart,
    globalPromotion,
    cartSubtotal,
    globalPromotionDiscount,
    paymentBalance,
    giftCardScanInput,
    setGiftCardScanInput,
    handleScanGiftCard,
  } = useCheckoutFormCore({
    defaultValues: resolvedDefaults as CartFormValues,
    autoRecalculateGiftCardSplits: false,
  });

  const { refunds } = useTransactionRefunds(transaction.id);

  //TODO should hihglight the paper group that contains the error
  const onSubmitError = (err: FieldErrors<CartFormValues>) => {
    console.error(err);
    for (const message of collectFormErrorMessages(err)) {
      toast.error(message);
    }
  };

  const noop = () => { };

  const content = (
    <FormProvider {...form}>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <TransactionInfoCard transaction={transaction} refunds={editable ? undefined : refunds} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <CartTable
            fields={cartFields}
            update={(index, value) => updateCartItem(index, value as Schema["cart"][number])}
            remove={editable ? removeCartItem : noop}
            allowRemove={editable}
            minQuantity={0}
            removeOnZero={false}
            quantityEditable={editable}
            size="small"
            emptyMessage="Aucun article"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <OrderSummary
            cart={cart}
            cartSubtotal={cartSubtotal}
            globalPromotionDiscount={globalPromotionDiscount}
            paymentBalance={paymentBalance}
            globalPromotion={globalPromotion}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <PaymentPanel
            readOnly={!editable}
            showSubmitButton={false}
            paymentFields={paymentFields}
            appendPayment={appendPayment}
            removePayment={removePayment}
            giftCardScanInput={giftCardScanInput}
            setGiftCardScanInput={setGiftCardScanInput}
            onScanGiftCard={handleScanGiftCard}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <RefundHistoryCard transaction={transaction} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <TransactionFinancialSummaryCard transaction={transaction} />
        </Grid>
      </Grid>
    </FormProvider>
  );

  if (editable && onSubmit) {
    return (
      <Box component="form" id={formId} onSubmit={form.handleSubmit(onSubmit,onSubmitError)}>
        {content}
      </Box>
    );
  }

  return content;
};
