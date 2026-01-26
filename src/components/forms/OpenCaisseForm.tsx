import { zodResolver } from "@hookform/resolvers/zod";
import { AttachMoney, Euro } from "@mui/icons-material";
import { Button, Grid, InputAdornment, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { StoreModel } from "../../interfaces/Models";
import { idSchema } from "../../interfaces/ZodTypes";
import { fetchCaisses } from "../../services/api/store";
import { emptyStringToNull } from "../../services/zodTransform";
import { usePrompt } from "../Prompt";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";

interface OpenCaisseFormProps extends BaseFormProps<Schema> {
  stores: StoreModel[];
  setShowMoneyCounter?: (b: boolean) => number;
}

const schema = z.object({
  store_id: idSchema("store requis"),
  cash_register_id: idSchema("caisse requis"),
  opening_amount: z.coerce.number().positive(),
  notes: z.string().transform((val) => (val == "" ? null : val)),
});

type Schema = z.infer<typeof schema>;

export const OpenCaisseForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores,
}: OpenCaisseFormProps) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const { prompt, PromptDialog } = usePrompt();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      store_id: "",
      cash_register_id: "",
      opening_amount: "",
      notes: "",
      ...data,
    },
  });

  const store = form.watch("store_id");
  const [cashRegisters, setCashRegisters] = useState([]);
  const getCaisses = async () => {
    const caisses = await fetchCaisses(store);
    setCashRegisters(caisses.data.data);
  };

  useEffect(() => {
    if (store) getCaisses();
    else setCashRegisters([]);
    console.log(cashRegisters);
  }, [store]);

  return (
    <>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormSelect name="store_id" control={form.control} label="Magasin">
              {stores.map((store) => (
                <MenuItem key={store.id} value={store.id}>
                  {store.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormSelect
              name="cash_register_id"
              control={form.control}
              label="Caisse"
            >
              {cashRegisters.map((register) => (
                <MenuItem key={register.id} value={register.id}>
                  {register.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormInput
              name="opening_amount"
              control={form.control}
              label="Fonds de caisse (€)"
              extra={{
                onClick: async () =>
                  form.setValue(
                    "opening_amount",
                    await prompt(
                      "",
                      form.getValues("opening_amount")?.toString() || "",
                      { unit: "€" },
                    ),
                  ),
                sx: {
                  "& .MuiInputBase-input": {
                    cursor: "pointer",
                    backgroundColor: "#f8f9fa",
                  },
                },
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
                              "opening_amount",
                              await prompt(
                                "",
                                form.getValues("opening_amount")?.toString() ||
                                  "",
                                { mode: "money", unit: "€" },
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
              name="notes"
              control={form.control}
              label="Notes (optionnel)"
              extra={{
                multiline: true,
                rows: 2,
              }}
            />
          </Grid>
        </Grid>
      </form>
      {PromptDialog}
    </>
  );
};
