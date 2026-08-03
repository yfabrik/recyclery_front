import { zodResolver } from "@hookform/resolvers/zod";
import { AttachMoney, Euro } from "@mui/icons-material";
import { Button, Grid, InputAdornment } from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createPromptNumericValue } from "../../hooks/useSetNumericValue";
import {
  closeCaisseFormSchema,
  type CloseCaisseFormOutput,
  type CloseCaisseFormValues,
} from "../../services/schema/caisse";
import { usePrompt } from "../Prompt";
import { FormInput, type BaseFormProps } from "./FormBase";

export type { CloseCaisseFormValues, CloseCaisseFormOutput };

export const CloseCaisseForm = ({
  formId,
  onSubmit,
  state,
  setState,
  closingAmount,
  setClosingAmount,
  expectedAMount,
}: BaseFormProps<CloseCaisseFormValues, CloseCaisseFormOutput> & {
  state: "prepare" | "valid";
  setState: React.Dispatch<React.SetStateAction<"prepare" | "valid">>;
  closingAmount: number;
  setClosingAmount: React.Dispatch<React.SetStateAction<number>>;
  expectedAMount?: number;
}) => {
  const form = useForm<CloseCaisseFormValues, unknown, CloseCaisseFormOutput>({
    resolver: zodResolver(closeCaisseFormSchema),
    defaultValues: {
      closing_amount: "",
      notes: "",
    },
  });
  const { prompt, PromptDialog } = usePrompt();
  const setNumericField = createPromptNumericValue(form, prompt);
  const watchedValues = form.watch("closing_amount");

  useEffect(() => {
    setState("prepare");
  }, [watchedValues, setState]);

  const submited = (data: CloseCaisseFormOutput) => {
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
                onClick: () => setNumericField("closing_amount", "€"),
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
                            setNumericField("closing_amount", {
                              unit: "€",
                              mode: "money",
                              valueToReach: expectedAMount,
                            });
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
