import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Grid, InputAdornment } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { AttachMoney, Euro } from "@mui/icons-material";
import { usePrompt } from "../Prompt";
import { FormInput, type BaseFormProps } from "./FormBase";

const schema = z.object({
  closing_amount: z.coerce
    .number("Veuillez saisir le montant de fermeture")
    .positive("Veuillez saisir le montant de fermeture"),
  notes: z.string().transform((val) => (val == "" ? null : val)),
});

export type Schema = z.infer<typeof schema>;

export const CloseCaisseForm = ({
  formId,
  onSubmit,
}: BaseFormProps<Schema>) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      closing_amount: "",
      notes: "",
    },
  });
  const { prompt, PromptDialog } = usePrompt();
  return (
    <>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Montant en caisse (€)"
              control={form.control}
              name="closing_amount"
              extra={{
                onClick: async () =>
                  form.setValue(
                    "closing_amount",
                    await prompt(
                      "",
                      form.getValues("closing_amount")?.toString() || "",
                      { unit: "€" },
                    ),
                  ),
                sx: {
                  "& .MuiInputBase-input": {
                    cursor: "pointer",
                    backgroundColor: "#f8f9fa",
                  },
                },
                helperText:
                  "Comptez l'argent physiquement présent dans la caisse",
                slotProps: {
                  input: {
                    startAdornment: (
                      <Euro sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            form.setValue(
                              "closing_amount",
                              await prompt(
                                "",
                                form.getValues("closing_amount")?.toString() ||
                                  "",
                                { unit: "€", mode: "money" },
                              ),
                            );
                          }}
                          startIcon={<AttachMoney />}
                        >
                          Compteur
                        </Button>
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormInput
              label="Notes de fermeture (optionnel)"
              control={form.control}
              name="notes"
              extra={{
                multiline: true,
                rows: 3,
              }}
            />
          </Grid>
        </Grid>
      </form>
      {PromptDialog}
    </>
  );
};
