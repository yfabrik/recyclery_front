import { zodResolver } from "@hookform/resolvers/zod";
import { AttachMoney, Euro } from "@mui/icons-material";
import { Button, Grid, InputAdornment, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { createPromptNumericValue } from "../../hooks/useSetNumericValue";
import type { StoreModel } from "../../interfaces/Models";
import { optionalId } from "../../interfaces/ZodTypes";
import { fetchCaisses, fetchStores } from "../../services/api/store";
import { emptyToNull } from "../../services/zodTransform";
import { usePrompt } from "../Prompt";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";

export type OpenCaissePayload = {
  store_id: number;
  cash_register_id: number;
  opening_amount: number;
  notes: string | null;
};

const schema = z.object({
  store_id: optionalId("store requis").refine((v): v is number => v !== "", {
    message: "store requis",
  }),
  cash_register_id: optionalId("caisse requis").refine(
    (v): v is number => v !== "",
    { message: "caisse requis" },
  ),
  opening_amount: z
    .union([z.literal(""), z.number().positive("solde requis")])
    .refine((v): v is number => v !== "", { message: "solde requis" }),
  notes: z.string(),
});

export type OpenCaisseFormValues = z.input<typeof schema>;
export type OpenCaisseFormOutput = z.infer<typeof schema>;
/** @deprecated Use OpenCaissePayload for submit / OpenCaisseFormValues for form state */
export type Schema = OpenCaissePayload;

interface OpenCaisseFormProps
  extends BaseFormProps<OpenCaisseFormValues, OpenCaissePayload> {
  stores?: StoreModel[];
  setShowMoneyCounter?: (b: boolean) => number;
  lockStoreAndRegister?: boolean;
}

export const OpenCaisseForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores: storesProp,
  lockStoreAndRegister = false,
}: OpenCaisseFormProps) => {
  const storesQuery = useQuery({
    queryKey: ["stores", { active: true }],
    queryFn: () =>
      fetchStores({ active: true }).then((response) => response.data.data),
    enabled: !storesProp,
  });

  const storeOptions = useMemo(() => {
    return storesProp ?? storesQuery.data ?? [];
  }, [storesProp, storesQuery.data]);

  const { prompt, PromptDialog } = usePrompt();
  const form = useForm<OpenCaisseFormValues, unknown, OpenCaisseFormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      store_id: "",
      cash_register_id: "",
      opening_amount: "",
      notes: "",
      ...defaultValues ?? {},
    },
  });

  const defaultStoreId = defaultValues?.store_id;
  const defaultCashRegisterId = defaultValues?.cash_register_id;

  const store = form.watch("store_id");
  const selectedStore = storeOptions.find((s) => s.id == store);
  const registersFromStore = selectedStore?.caisses ?? [];

  useEffect(() => {
    if (defaultStoreId == null || defaultStoreId === "" || !storeOptions.length)
      return;
    if (!storeOptions.some((s) => s.id === defaultStoreId)) return;
    form.setValue("store_id", defaultStoreId, { shouldValidate: true });

    if (defaultCashRegisterId == null || defaultCashRegisterId === "") return;
    const storeForDefaults = storeOptions.find((s) => s.id === defaultStoreId);
    const registers = storeForDefaults?.caisses ?? [];
    if (!registers.some((r) => r.id === defaultCashRegisterId)) return;
    form.setValue("cash_register_id", defaultCashRegisterId, {
      shouldValidate: true,
    });
  }, [defaultStoreId, defaultCashRegisterId, storeOptions, form]);

  const cashRegisters = useQuery({
    queryKey: ["cashRegisters", { store_id: store }],
    queryFn: () =>
      fetchCaisses(store as number).then((response) => response.data.data),
    enabled: typeof store === "number" && registersFromStore.length === 0,
  });

  const registerOptions =
    registersFromStore.length > 0
      ? registersFromStore
      : (cashRegisters.data ?? []);

  const setNumericField = createPromptNumericValue(form, prompt);

  return (
    <>
      <form
        id={formId}
        onSubmit={form.handleSubmit((data) => {
          onSubmit({
            store_id: data.store_id,
            cash_register_id: data.cash_register_id,
            opening_amount: data.opening_amount,
            notes: emptyToNull(data.notes),
          });
        })}
      >
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <FormSelect
              name="store_id"
              control={form.control}
              label="Magasin"
              extra={{ disabled: lockStoreAndRegister }}
            >
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
                onClick: () => setNumericField("opening_amount", "€"),
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
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={async (e) => {
                            e.stopPropagation();
                            setNumericField("opening_amount", {
                              unit: "€",
                              mode: "money",
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
              name="notes"
              control={form.control}
              label="Notes (optionnel)"
              extra={{ multiline: true, rows: 2 }}
            />
          </Grid>
        </Grid>
      </form>
      {PromptDialog}
    </>
  );
};
