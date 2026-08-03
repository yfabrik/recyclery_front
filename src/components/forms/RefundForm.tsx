import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Grid, MenuItem, Typography } from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import { REFUND_PAYMENT_METHODS } from "../../constants/paymentMethods";
import { REFUND_REASONS } from "../../constants/refundReasons";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import {
  formatCurrency,
  getCartLinePrice,
  getPaymentMethodLabel,
} from "../../services/cartService";
import type { CartItem } from "../../services/schema/cart";
import {
  refundFormSchema,
  type RefundFormOutput,
  type RefundFormValues,
  type RefundItem,
} from "../../services/schema/refund";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";
import { CartTable } from "../pos/CartTable";

export type { RefundFormValues, RefundFormOutput };

const sumRefundPrice = (
  cart: RefundFormOutput["cart"],
  transaction: TransactionModel,
  alreadyRefunded: RefundItem[],
) => {
  const totalPromo =
    transaction.total_amount_before_promotion - transaction.total_amount;
  const totalItems =
    transaction.items?.reduce(
      (prev, current) => (prev += current.TransactionItem?.quantity ?? 0),
      0,
    ) || 0;
  const totalPromoPerItem = totalPromo / totalItems;
  return cart.reduce((prev, current) => {
    const alreadyRefundedQuantity =
      alreadyRefunded.find((item) => item.barcode === current.barcode)
        ?.refundQuantity || 0;
    const currentPrice = getCartLinePrice(current as CartItem);
    const refundPrice =
      (currentPrice / current.quantity - totalPromoPerItem) *
      (current.refundQuantity - alreadyRefundedQuantity);
    prev += refundPrice;
    return prev;
  }, 0);
};

export const RefundForm = ({
  selectedTransaction,
  formId,
  onSubmit,
  categories,
}: BaseFormProps<RefundFormValues, RefundFormOutput> & {
  selectedTransaction: TransactionModel;
  categories: CategoryModel[];
}) => {
  const cartItems = selectedTransaction.items?.map((item) => {
    const category = categories?.find((c) => c.id === item.category_id);
    const subcategory = category?.subcategories?.find(
      (c) => c.id === item.category_id,
    );
    const alreadyRefunded = selectedTransaction.refunds?.reduce(
      (prev, current) => {
        prev +=
          current.items
            ?.filter((i) => i.barcode === item.barcode)
            .reduce((p, v) => p + (v.TransactionItem?.quantity ?? 0), 0) ?? 0;
        return prev;
      },
      0,
    );

    return {
      ...item,
      ...item.TransactionItem,
      category_name: category?.name || "",
      subcategory_name: subcategory?.name || "",
      promotion: item.TransactionItem?.promotionValue ?? 0,
      refundQuantity: alreadyRefunded || 0,
      description: "",
    } satisfies RefundItem;
  }) as RefundItem[];

  const form = useForm<RefundFormValues, unknown, RefundFormOutput>({
    defaultValues: {
      cart: cartItems || [],
      refund_reason: "",
      refund_method: "",
      gift_card_code: "",
      notes: "",
    } satisfies Partial<RefundFormValues>,
    resolver: zodResolver(refundFormSchema),
  });

  const cart = form.watch("cart");
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "cart",
  });
  const giftCardCode = form.watch("refund_method");
  const noop = () => {};

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit, (err) => console.error(err))}
    >
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <CartTable
            fields={fields}
            update={(index, value) =>
              update(index, value as (typeof fields)[number])
            }
            remove={noop}
            allowRemove={false}
            quantityEditable={false}
            showRefundColumn
            size="small"
            canDecreaseRefund={(index) =>
              form.getFieldState(`cart.${index}`).isDirty
            }
            canIncreaseRefund={(_index, item) =>
              (item.refundQuantity ?? 0) < item.quantity
            }
            onRefundQuantityChange={(index, refundQuantity) => {
              const item = fields[index];
              form.setValue(`cart.${index}.refundQuantity`, refundQuantity, {
                shouldDirty: true,
                shouldTouch: true,
              });
              update(index, { ...item, refundQuantity });
            }}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Détails du remboursement
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormSelect
                  control={form.control}
                  name="refund_reason"
                  label="Raison du remboursement"
                >
                  <MenuItem value="">
                    <em>Sélectionner une raison</em>
                  </MenuItem>
                  {REFUND_REASONS.map((reason) => (
                    <MenuItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </MenuItem>
                  ))}
                </FormSelect>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormSelect
                  control={form.control}
                  name="refund_method"
                  label="Mode de remboursement"
                >
                  <MenuItem value="">
                    <em>Sélectionner un mode</em>
                  </MenuItem>
                  {REFUND_PAYMENT_METHODS.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </FormSelect>
              </Grid>

              {giftCardCode === "giftcard" && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput
                    control={form.control}
                    name="gift_card_code"
                    label="Code du GiftCard"
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <FormInput
                  control={form.control}
                  name="notes"
                  label="Notes (optionnel)"
                  extra={{
                    placeholder: "Informations supplémentaires...",
                  }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa" }}>
            <Typography variant="subtitle2" gutterBottom>
              Résumé du remboursement
            </Typography>
            <Typography variant="body2">
              Montant à rembourser:{" "}
              <strong>
                {formatCurrency(
                  sumRefundPrice(
                    cart,
                    selectedTransaction,
                    cartItems ?? ([] as RefundItem[]),
                  ),
                )}
              </strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Mode de remboursement:{" "}
              <strong>
                {giftCardCode
                  ? getPaymentMethodLabel(
                      giftCardCode as RefundFormOutput["refund_method"],
                    )
                  : "—"}
              </strong>
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </form>
  );
};
