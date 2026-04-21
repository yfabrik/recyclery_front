import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button } from "@mui/material";
import { useForm, type UseFormReset } from "react-hook-form";
import * as z from "zod";
import { noEmptyStr } from "../../interfaces/ZodTypes";
import { FormInput, type BaseFormProps } from "./FormBase";
import { useEffect } from "react";

const schema = z.object({
  name: noEmptyStr("nom requis"),
});

export type Schema = z.infer<typeof schema>;

export const CreateCaisseForm = ({
  formId,
  onSubmit,
  onReady,
}: BaseFormProps<Schema> & {
  onReady?: (methods: { reset: UseFormReset<Schema> }) => void;
}) => {
  const form = useForm({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(schema),
  });

  const reset = form.reset;
  // give parent access to reset
  useEffect(() => {
    if (onReady) {
      onReady({ reset });
    }
  }, [onReady, reset]);

  const name = form.watch("name");
  // useEffect(() => {
  //   form.reset();
  // }, [form.formState.isSubmitSuccessful]);

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
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
