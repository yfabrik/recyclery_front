import { zodResolver } from "@hookform/resolvers/zod";
import {
  createGiftCardSchema,
  type CreateGiftCardFormOutput,
  type CreateGiftCardFormValues,
} from "../../services/schema/giftcard";
import { useForm } from "react-hook-form";
import {
  FormDate,
  FormInput,
  FormNumber,
  type BaseFormProps,
} from "./FormBase";
import { Box } from "@mui/material";

export const GiftCardForm = ({
  onSubmit,
  formId,
}: BaseFormProps<CreateGiftCardFormValues, CreateGiftCardFormOutput>) => {
  const form = useForm<
    CreateGiftCardFormValues,
    unknown,
    CreateGiftCardFormOutput
  >({
    defaultValues: {
      initial_value: "",
      expires_at: null,
      note: "",
      recipient_name: "",
      recipient_email: "",
    },
    resolver: zodResolver(createGiftCardSchema),
  });
  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit, (e) => console.log("errors", e))}
    >
      <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
        <FormNumber
          name="initial_value"
          label="Montant initial"
          control={form.control}
        />
        <FormDate
          name="expires_at"
          label="Date d'expiration"
          control={form.control}
        />
        <FormInput
          name="recipient_name"
          label="Nom du bénéficiaire"
          control={form.control}
        />
        <FormInput
          name="recipient_email"
          label="Email du bénéficiaire"
          control={form.control}
        />
        <FormInput
          name="note"
          label="Note"
          extra={{ multiline: true, minRows: 2 }}
          control={form.control}
        />
      </Box>
    </form>
  );
};
