import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  MenuItem
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormInput, FormSelect, type BaseFormProps } from "./FormBase";

interface CategorieFormProps extends BaseFormProps<Schema> {
  icons: Array<{ name: string; label: string }>;
  
}
const schema = z.object({
  name: z.string().trim().nonempty(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  parent_id:z.string().nullable()
})

type Schema = z.infer<typeof schema>

export const CategorieForm = ({
  icons,
  formId,
  onSubmit,
  defaultValues,

}: CategorieFormProps) => {
  const form = useForm({
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      icon: "",
      parent_id: null,
    },
    resolver: zodResolver(schema),
  });


  const getIconComponent = (name: string) => {
    return name;
  };

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <FormInput control={form.control} label="Nom de la catégorie" name="name" extra={{ margin: 'normal' }} />
      <FormInput control={form.control} label="Description" name="description" extra={{
        multiline: true,
        rows: 3,
        margin: 'normal'
      }} />
      <FormSelect control={form.control} label="Icône" name="icon">
        {icons.map((icon) => (
          <MenuItem key={icon.name} value={icon.name}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getIconComponent(icon.name)}
              {icon.label}
            </Box>
          </MenuItem>
        ))}
      </FormSelect>

    </form>
  );
};
