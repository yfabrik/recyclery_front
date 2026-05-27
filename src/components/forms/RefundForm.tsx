import {
  Box,
  Card,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useForm } from "react-hook-form";
import z from "zod";
import type { CategoryModel, TransactionModel } from "../../interfaces/Models";
import {
  formatCurrency,
  formatWeight,
  getCartLinePrice,
  getPaymentMethodLabel,
} from "../../services/cartService";
import { itemSchema } from "./cartSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import { Add, Backpack, Loyalty, Remove } from "@mui/icons-material";
import { useFieldArray } from "react-hook-form";
import { FormInput, FormSelect, type BaseFormProps } from "../forms/FormBase";
import { type CartItem } from "../forms/cartSchema";

const sumRefundPrice=(cart:Schema["cart"],transaction:TransactionModel,alreadyRefunded:ItemToRefund[])=>{
  const totalPromo = transaction.total_amount_before_promotion-transaction.total_amount ;
  const totalItems = transaction.items?.reduce((prev, current) => prev+=current.TransactionItem.quantity,0) || 0;
  const totalPromoPerItem = totalPromo / totalItems;
return cart.reduce((prev, current) => {
  const alreadyRefundedQuantity = alreadyRefunded.find((item) => item.barcode === current.barcode)?.refundQuantity || 0;
  const currentPrice = getCartLinePrice(current as CartItem)
  const refundPrice = (currentPrice/current.quantity-totalPromoPerItem)*(current.refundQuantity-alreadyRefundedQuantity)
  prev += refundPrice
  return prev
},0)
}
const refundItemSchema = itemSchema.extend({
  refundQuantity: z.number(),
});
type ItemToRefund = z.infer<typeof refundItemSchema>;

const REFUND_REASONS = [
  "customer_request",
  "product_defect",
  "wrong_product",
  "overcharge",
  "return_policy",
  "other",
] as const;

const REFUND_METHODS = ["cash", "card", "check", "giftcard"] as const;

const requiredSelect = <const T extends readonly [string, ...string[]]>(
  values: T,
  message: string,
) =>
  z
    .union([z.literal(""), z.enum(values)])
    .refine((v) => v !== "", { message })
    .pipe(z.enum(values, message));

const schema = z.object({
  cart: z.array(refundItemSchema),
  refund_reason: requiredSelect(REFUND_REASONS, "raison requis"),
  refund_method: requiredSelect(REFUND_METHODS, "methode requis"),
  gift_card_code: z.string().transform(v => v == "" ? null : v).optional(),
  notes: z.string(),
});
export type Schema = z.infer<typeof schema>;
type FormValues = z.input<typeof schema>;

export const RefundForm = ({
  selectedTransaction,
  formId,
  onSubmit,
  categories,
}: BaseFormProps<Schema> & {
  selectedTransaction: TransactionModel;
  categories: CategoryModel[];
}) => {
  //   const categories = useQuery({
  //     queryKey: [
  //       "categories",
  //       { include: ["category", "promo"], only_category: true, sell: true },
  //     ],
  //     queryFn: () =>
  //       fetchCategories({
  //         include: ["category", "promo"],
  //         only_category: true,
  //         sell: true,
  //       }).then((response) => response.data.categories),
  //   });
  const cartItems = selectedTransaction.items?.map((item) => {
    const category = categories?.find((c) => c.id === item.category_id);
    const subcategory = category?.subcategories?.find(
      (c) => c.id === item.category_id,
    );
    const alreadyRefunded = selectedTransaction.refunds?.reduce(
      (prev, current) => {
        const items = current.items?.filter((i) => i.barcode == item.barcode);
        prev +=
          items?.reduce((p, v) => (p += v.TransactionItem.quantity), 0) || 0;
        return prev;
      },
      0,
    );

    //manque la possibilité de faire un autre refund, faut recup les deja refund et empecher de reduire le refund count
    return {
      ...item,
      ...item.TransactionItem,
      category_name: category?.name || "",
      subcategory_name: subcategory?.name || "",
      promotion: item.TransactionItem.promotionValue,
      refundQuantity: alreadyRefunded || 0,
      description: "",
    } satisfies ItemToRefund;
  });
  const form = useForm<FormValues, unknown, Schema>({
    defaultValues: {
      cart: cartItems || [],
      refund_reason: "",
      refund_method: "",
      gift_card_code: "",
      notes: "",
    } satisfies Partial<FormValues>,
    resolver: zodResolver(schema),
  });
  const cart = form.watch("cart") as Schema["cart"];
  const { fields, update } = useFieldArray({
    control: form.control,
    name: "cart",
  });
  const giftCardCode = form.watch("refund_method");

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit, (err) => console.error(err))}>
      {/* TODO need list des items with checkbox to select witch one to refunds + 1 checkbox on top to select all 
      refund_method need "giftCard"?
      */}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Article</TableCell>
                <TableCell>Poids unitaire</TableCell>
                <TableCell>Prix unitaire</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Refunds</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((item, index) => (
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
                        <Typography variant="body1" fontWeight="medium">
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
                      <Typography variant="body2" color="textSecondary">
                        {item.barcode}
                      </Typography>
                      {(item.category_name || item.subcategory_name) && (
                        <Typography variant="body2" color="textSecondary">
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
                      <Typography sx={{ minWidth: 30, textAlign: "center" }}>
                        {item.quantity}
                      </Typography>

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
                      {getCartLinePrice(item as CartItem).toFixed(2)}€
                    </Typography>
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
                          // if (item.refundQuantity === 0) return
                          if (!form.getFieldState(`cart.${index}`).isDirty)
                            return;
                          form.setValue(
                            `cart.${index}.refundQuantity`,
                            item.refundQuantity - 1,
                            { shouldDirty: true, shouldTouch: true },
                          ); //pour dirty field
                          return update(index, {
                            ...item,
                            refundQuantity: item.refundQuantity - 1,
                          });
                        }}
                      >
                        <Remove />
                      </IconButton>
                      <Typography sx={{ minWidth: 30, textAlign: "center" }}>
                        {item.refundQuantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (item.refundQuantity === item.quantity) return;
                          form.setValue(
                            `cart.${index}.refundQuantity`,
                            item.refundQuantity - 1,
                            { shouldDirty: true, shouldTouch: true },
                          ); //just pour dirty field
                          return update(index, {
                            ...item,
                            refundQuantity: item.refundQuantity + 1,
                          });
                        }}
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Raison du remboursement */}
        <Grid size={{ xs: 12 }}>
          <FormSelect
            control={form.control}
            name="refund_reason"
            label="Raison du remboursement"
          >
            <MenuItem value="">
              <em>Sélectionner une raison</em>
            </MenuItem>
            <MenuItem value="customer_request">Demande client</MenuItem>
            <MenuItem value="product_defect">Produit défectueux</MenuItem>
            <MenuItem value="wrong_product">Mauvais produit</MenuItem>
            <MenuItem value="overcharge">Surcharge</MenuItem>
            <MenuItem value="return_policy">Politique de retour</MenuItem>
            <MenuItem value="other">Autre</MenuItem>
          </FormSelect>
        </Grid>

        {/* Mode de remboursement */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            control={form.control}
            name="refund_method"
            label="Mode de remboursement"
          >
            <MenuItem value="">
              <em>Sélectionner un mode</em>
            </MenuItem>
            <MenuItem value="cash">Espèces</MenuItem>
            <MenuItem value="card">Carte bancaire</MenuItem>
            <MenuItem value="check">Chèque</MenuItem>
            <MenuItem value="giftcard">GiftCard</MenuItem>
          </FormSelect>
        </Grid>
        {giftCardCode === "giftcard" && (
          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput control={form.control} name="gift_card_code" label="Code du GiftCard" />
          </Grid>
        )}
        {/* Notes */}
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

        {/* Résumé du remboursement */}
        <Grid size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ p: 2, bgcolor: "#e3f2fd" }}>
            <Typography variant="subtitle2" gutterBottom>
              Résumé du remboursement
            </Typography>
            <Typography variant="body2">
              Montant à rembourser:{" "}
              <strong>
                {sumRefundPrice(cart, selectedTransaction,cartItems??[] as ItemToRefund[]).toFixed(2)}€
              </strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Mode de remboursement:{" "}
              <strong>
                {giftCardCode
                  ? getPaymentMethodLabel(giftCardCode as Schema["refund_method"])
                  : "—"}
              </strong>
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </form>
  );
};
