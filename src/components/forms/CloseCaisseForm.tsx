import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Grid, InputAdornment } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { AttachMoney, Euro } from "@mui/icons-material";
import { useEffect } from "react";
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
  state,
  setState,
  closingAmount,
  setClosingAmount,
  expectedAMount
}: BaseFormProps<Schema> & {
  state: "prepare" | "valid";
  setState: React.Dispatch<React.SetStateAction<"prepare" | "valid">>;
  closingAmount: number;
  setClosingAmount: React.Dispatch<React.SetStateAction<number>>;
  expectedAMount?:number
}) => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      closing_amount: "",
      notes: "",
    },
  });
  const { prompt, PromptDialog } = usePrompt();

  const watchedValues = form.watch("closing_amount");

  useEffect(() => {
    setState("prepare");
  }, [watchedValues, setState]);

  const submited = (data: Schema) => {
    if (state == "prepare") setState("valid");
    else onSubmit(data);
  };

  return (
    <>
      <form id={formId} onSubmit={form.handleSubmit(submited)}>
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
                    { shouldDirty: true, shouldTouch: true },
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
                                { unit: "€", mode: "money","valueToReach":expectedAMount },
                              ),
                              { shouldDirty: true, shouldTouch: true },
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
        <Button
          onClick={form.handleSubmit((values) => {
            setState("valid");
            setClosingAmount(values.closing_amount);
          })}
          sx={{ margin: 1 }}
          type="button"
          variant="contained"
        >
          valider
        </Button>
      </form>
      {PromptDialog}
    </>
  );
};
