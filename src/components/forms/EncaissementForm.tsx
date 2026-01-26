import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Grid, MenuItem, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";

import { Euro } from "@mui/icons-material";
import * as z from "zod";
import { emptyStringToNull } from "../../services/zodTransform";

type Schema = z.infer<ReturnType<typeof createSchema>>;

const createSchema = (totalCart: number) =>
  z.object({
    payment_method: z.enum(["cash", "card", "check"]),
    payment_amount: z
      .coerce.number()
      .min(totalCart, {
        message: `Le montant payé ne peut pas être inférieur au total du panier (${totalCart.toFixed(2)}€)`,
      }),
    customer_name: z.string().transform((val) => (val == "" ? null : val)),
    customer_email: z.union([z.email(), z.literal("").transform(() => null)]),
  });

export const EncaissementForm = ({
  formId,
  onSubmit,
  defaultValues,
  totalCart,
}: BaseFormProps<Schema> & { totalCart: number }) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const schema = createSchema(totalCart);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      payment_method: "cash" as const,
      payment_amount: "",
      customer_name: "",
      customer_email: "",
      ...data,
    },
  });

  const payment_amount = form.watch("payment_amount");
  const paymentAmountNum =
    typeof payment_amount === "string"
      ? parseFloat(payment_amount) || 0
      : typeof payment_amount === "number"
        ? payment_amount
        : 0;

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" color="primary" textAlign="center">
            Total à encaisser: {totalCart.toFixed(2)}€
          </Typography>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormSelect
            label="Mode de paiement"
            control={form.control}
            name="payment_method"
          >
            <MenuItem value="cash">Espèces</MenuItem>
            <MenuItem value="card">Carte bancaire</MenuItem>
            <MenuItem value="check">Chèque</MenuItem>
          </FormSelect>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormInput
            label="Montant payé (€)"
            control={form.control}
            name="payment_amount"
            extra={{
              type: "number",
              slotProps: {
                input: {
                  startAdornment: (
                    <Euro sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                },
              },
            }}
          />
        </Grid>

        {paymentAmountNum > totalCart && (
          <Grid size={{ xs: 12 }}>
            <Alert severity="info">
              Rendu à donner: {(paymentAmountNum - totalCart).toFixed(2)}€
            </Alert>
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            label="Nom du client (optionnel)"
            control={form.control}
            name="customer_name"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput
            label="Email du client (optionnel)"
            control={form.control}
            name="customer_email"
          />
        </Grid>
      </Grid>
    </form>
  );
};
