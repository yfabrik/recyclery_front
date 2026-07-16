import { zodResolver } from "@hookform/resolvers/zod";
import { AttachMoney, Euro } from "@mui/icons-material";
import { Button, Grid, InputAdornment, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import type { StoreModel } from "../../interfaces/Models";
import { idSchema } from "../../interfaces/ZodTypes";
import { fetchCaisses, fetchStores } from "../../services/api/store";
import { usePrompt } from "../Prompt";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";

interface OpenCaisseFormProps extends BaseFormProps<OpenCaisseFormValues,Schema> {
  /** Preloaded stores (e.g. from POS) so selects have options before async fetch. */
  stores?: StoreModel[];
  setShowMoneyCounter?: (b: boolean) => number;
  // defaultStoreId?: number;
  // defaultCashRegisterId?: number;
  lockStoreAndRegister?: boolean;
}

const schema = z.object({
  store_id: idSchema("store requis"),
  cash_register_id: idSchema("caisse requis"),
  opening_amount: z.coerce.number().positive("solde requis"),
  notes: z.string().transform((val) => (val == "" ? null : val)),
});

export type Schema = z.infer<typeof schema>;
export type OpenCaisseFormValues = z.input<typeof schema>;

export const OpenCaisseForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores: storesProp,
  // defaultStoreId,//TODO use defualt
  // defaultCashRegisterId,//TODO use defualt
  lockStoreAndRegister = false,
}: OpenCaisseFormProps) => {
  const storesQuery = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () =>
      fetchStores({ active: true }).then((response) => response.data.data),
    enabled: !storesProp,
  });

  const storeOptions = storesProp ?? storesQuery.data ?? [];

  const { prompt, PromptDialog } = usePrompt();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      store_id: "",
      cash_register_id: "",
      opening_amount: "",
      notes: "",
      ...defaultValues ?? {},
    },
  });

  //TODO ????? y'avait une error de chargement quand les store sont pas chargé mais qu'on donne des values
  const defaultStoreId = defaultValues?.store_id
  const defaultCashRegisterId = defaultValues?.cash_register_id

  const store = form.watch("store_id") as number;
  const selectedStore = storeOptions.find((s) => s.id == store);
  const registersFromStore = selectedStore?.caisses ?? [];

  useEffect(() => {
    if (!defaultStoreId || !storeOptions.length) return;
    if (!storeOptions.some((s) => s.id === defaultStoreId)) return;
    form.setValue("store_id", defaultStoreId, { shouldValidate: true });

    if (!defaultCashRegisterId) return;
    const storeForDefaults = storeOptions.find((s) => s.id === defaultStoreId);
    const registers = storeForDefaults?.caisses ?? [];
    if (!registers.some((r) => r.id === defaultCashRegisterId)) return;
    form.setValue("cash_register_id", defaultCashRegisterId, {
      shouldValidate: true,
    });
  }, [defaultStoreId, defaultCashRegisterId, storeOptions, form]);
  // const [cashRegisters, setCashRegisters] = useState([]);
  // const getCaisses = async () => {
  //   const caisses = await fetchCaisses(store);
  //   setCashRegisters(caisses.data.data);
  // };

  const cashRegisters = useQuery({
    queryKey: ["cashRegisters", { store_id: store }],
    queryFn: () =>
      fetchCaisses(store).then((response) => response.data.data),
    enabled: !!store && registersFromStore.length === 0,
  });

  const registerOptions =
    registersFromStore.length > 0
      ? registersFromStore
      : (cashRegisters.data ?? []);

  return (
    <>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormSelect name="store_id" control={form.control} label="Magasin" extra={{ disabled: lockStoreAndRegister }}>
              {storeOptions.map((storeOption) => (
                <MenuItem key={storeOption.id} value={storeOption.id}>
                  {storeOption.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormSelect
              name="cash_register_id"
              control={form.control}
              label="Caisse"
              extra={{ disabled: lockStoreAndRegister }}
            >
              {registerOptions.map((register) => (
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
                    // readOnly: true,
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
