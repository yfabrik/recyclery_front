import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Grid, MenuItem, Typography } from "@mui/material";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { REFUND_PAYMENT_METHODS } from "../../constants/paymentMethods";
import {
  REFUND_REASONS,
  REFUND_REASON_VALUES,
} from "../../constants/refundReasons";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import {
  formatCurrency,
  getCartLinePrice,
  getPaymentMethodLabel,
} from "../../services/cartService";
import { FormInput, FormSelect, type BaseFormProps } from "../forms/FormBase";
import { type CartItem } from "../forms/cartSchema";
import { CartTable } from "../pos/CartTable";
import { itemSchema } from "./cartSchema";
  
const sumRefundPrice = (
  cart: Schema["cart"],
  transaction: TransactionModel,
  alreadyRefunded: ItemToRefund[],
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

const refundItemSchema = itemSchema.extend({
  refundQuantity: z.number(),
});
type ItemToRefund = z.infer<typeof refundItemSchema>;

const REFUND_METHOD_VALUES = REFUND_PAYMENT_METHODS.map(
  (method) => method.value,
) as [
  (typeof REFUND_PAYMENT_METHODS)[number]["value"],
  ...(typeof REFUND_PAYMENT_METHODS)[number]["value"][],
];

const requiredSelect = <const T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) =>
  z
    .union([z.literal(""), z.enum(values)])
    .refine((v): v is T[number] => v !== "", { message });

const schema = z.object({
  cart: z.array(refundItemSchema),
  refund_reason: requiredSelect(REFUND_REASON_VALUES, "raison requis"),
  refund_method: requiredSelect(REFUND_METHOD_VALUES, "methode requis"),
  gift_card_code: z.string().optional(),
  notes: z.string(),
});
export type RefundFormPayload = {
  cart: z.infer<typeof refundItemSchema>[];
  refund_reason: (typeof REFUND_REASON_VALUES)[number];
  refund_method: (typeof REFUND_METHOD_VALUES)[number];
  gift_card_code: string | null | undefined;
  notes: string;
};

/** Submit payload after mapping empties — preferred by refund API helpers. */
export type Schema = RefundFormPayload;
type FormValues = z.input<typeof schema>;
type FormOutput = z.infer<typeof schema>;

export const RefundForm = ({
  selectedTransaction,
  formId,
  onSubmit,
  categories,
}: BaseFormProps<FormValues, RefundFormPayload> & {
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
        prev += current.items?.filter((i) => i.barcode === item.barcode).reduce((p, v) => p + (v.TransactionItem?.quantity ?? 0), 0) ?? 0;
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
    } satisfies ItemToRefund;
  }) as ItemToRefund[];

  const form = useForm<FormValues, unknown, FormOutput>({
    defaultValues: {
      cart: cartItems || [],
      refund_reason: "",
      refund_method: "",
      gift_card_code: "",
      notes: "",
    } satisfies Partial<FormValues>,
    resolver: zodResolver(schema),
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
      onSubmit={form.handleSubmit((data) => {
        onSubmit({
          cart: data.cart,
          refund_reason: data.refund_reason,
          refund_method: data.refund_method,
          gift_card_code:
            data.gift_card_code === "" || data.gift_card_code == null
              ? null
              : data.gift_card_code,
          notes: data.notes,
        });
      }, (err) => console.error(err))}
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
                    cartItems ?? ([] as ItemToRefund[]),
                  ),
                )}
           
              </strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Mode de remboursement:{" "}
              <strong>
                {giftCardCode
                  ? getPaymentMethodLabel(
                      giftCardCode as Schema["refund_method"],
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
