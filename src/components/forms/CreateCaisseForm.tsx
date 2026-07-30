import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button } from "@mui/material";
import { useEffect } from "react";
import { useForm, type UseFormReset } from "react-hook-form";
import {
  createCaissePayloadFromForm,
  type CreateCaissePayload,
} from "../../services/mapper/caisse";
import {
  createCaisseFormSchema,
  type CreateCaisseFormOutput,
  type CreateCaisseFormValues,
} from "../../services/schema/caisse";
import { FormInput, type BaseFormProps } from "./FormBase";

export type { CreateCaisseFormValues, CreateCaisseFormOutput, CreateCaissePayload };
/** @deprecated Use CreateCaisseFormOutput */
export type Schema = CreateCaissePayload;

export const CreateCaisseForm = ({
  formId,
  onSubmit,
  onReady,
}: BaseFormProps<CreateCaisseFormValues, CreateCaissePayload> & {
  onReady?: (methods: {
    reset: UseFormReset<CreateCaisseFormValues>;
  }) => void;
}) => {
  const form = useForm<CreateCaisseFormValues, unknown, CreateCaisseFormOutput>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(createCaisseFormSchema),
  });

  const reset = form.reset;
  useEffect(() => {
    if (onReady) {
      onReady({ reset });
    }
  }, [onReady, reset]);

  const name = form.watch("name");

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit((data) =>
        onSubmit(createCaissePayloadFromForm(data)),
      )}
    >
      <Box sx={{ mb: 2, mt: 2 }}>
        <FormInput
          control={form.control}
          label="Nom de la nouvelle caisse"
          name="name"
          extra={{
            slotProps: {
              input: {
                endAdornment: (
                  <Button
                    variant="contained"
                    size="small"
                    type="submit"
                    disabled={!name.trim()}
                  >
                    Ajouter
                  </Button>
                ),
              },
            },
          }}
        />
      </Box>
    </form>
  );
};
