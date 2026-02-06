import { zodResolver } from "@hookform/resolvers/zod";
import { Grid, MenuItem } from "@mui/material";
import { useForm } from "react-hook-form";
import z from "zod";
import type { StoreModel } from "../../interfaces/Models";
import { idSchema, noEmptyStr, nullString, phoneSchema } from "../../interfaces/ZodTypes";
import { emptyStringToNull } from "../../services/zodTransform";
import {
  FormInput,
  FormSelect,
  FormSwitch,
  type BaseFormProps,
} from "./FormBase";

const schema = z.object({
  prenom: noEmptyStr("prenom requis"),
  nom: noEmptyStr("nom requis"),
  phone: z.union([phoneSchema(), nullString()]),
  recyclery_id: z.union([idSchema(), nullString()]),
  isActive: z.boolean().default(true),
});

export type Schema = z.infer<typeof schema>;

export const EmployeeForm = ({
  formId,
  onSubmit,
  defaultValues,
  stores,
}: BaseFormProps<Schema> & {
  stores: StoreModel[];
}) => {
  const data = defaultValues ? emptyStringToNull(defaultValues) : {};
  const form = useForm({
    defaultValues: {
      prenom: "",
      nom: "",
      phone: "",
      isActive: true,
      recyclery_id: "",
      ...data,
    },
    resolver: zodResolver(schema),
  });

  return (
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <Grid container spacing={2} sx={{ mt: 1 }}>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput name="prenom" control={form.control} label="Prénom" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput name="nom" control={form.control} label="Nom" />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormInput name="phone" control={form.control} label="Téléphone" />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormSelect
            name="recyclery_id"
            label="Magasin"
            control={form.control}
          >
            <MenuItem key="no-store" value="">
              Aucun magasin assigné
            </MenuItem>
            {stores.map((store) => (
              <MenuItem key={store.id} value={store.id}>
                {store.name}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormSwitch
            name="isActive"
            control={form.control}
            label="employée actif"
          />
        </Grid>
      </Grid>
    </form>
  );
};

// import { type BaseFormProps } from "./FormBase";
// import { idSchema, phoneSchema } from "../../interfaces/ZodTypes";

// const roleEnum = z.enum([
//   "employee",
//   "manager",
//   "supervisor",
//   "driver",
//   "collector",
// ]);

// const schema = z.object({
//   username: z.string().nonempty("Le nom d'utilisateur est requis"),
//   email: z.email("Email invalide"),
//   role: roleEnum,
//   phone: z.string().optional(),
//   contract_hours: z.coerce
//     .number()
//     .min(1, "Minimum 1 heure")
//     .max(60, "Maximum 60 heures"),
//   recyclery_id: z.coerce.number().optional().nullable(),
// });

// export type EmployeeFormSchema = z.infer<typeof schema>;

// type RoleOption = {
//   value: z.infer<typeof roleEnum>;
//   label: string;
// };

// type EmployeeFormProps2 = BaseFormProps<EmployeeFormSchema> & {
//   roleOptions: RoleOption[];
// };

// export const EmployeeForm2 = ({
//   formId,
//   onSubmit,
//   defaultValues,
//   roleOptions,
// }: EmployeeFormProps2) => {
//   const form = useForm({
//     resolver: zodResolver(schema),
//     defaultValues: {
//       username: defaultValues?.username || "",
//       email: defaultValues?.email || "",
//       role: defaultValues?.role || "employee",
//       phone: defaultValues?.phone || "",
//       contract_hours:
//         defaultValues?.contract_hours !== undefined
//           ? defaultValues.contract_hours
//           : 35,
//       recyclery_id:
//         defaultValues?.recyclery_id !== undefined &&
//         defaultValues?.recyclery_id !== null
//           ? defaultValues.recyclery_id
//           : undefined,
//     },
//   });

//   return (
//     <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
//       <Grid container spacing={2} sx={{ mt: 1 }}>
//         <Grid size={{ xs: 12, sm: 6 }}>
//           <FormInput
//             control={form.control}
//             name="username"
//             label="Nom d'utilisateur"
//             extra={{ required: true }}
//           />
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6 }}>
//           <FormInput
//             control={form.control}
//             name="email"
//             label="Email"
//             extra={{ required: true, type: "email" }}
//           />
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6 }}>
//           <FormSelect control={form.control} name="role" label="Rôle">
//             {roleOptions.map((role) => (
//               <MenuItem key={role.value} value={role.value}>
//                 {role.label}
//               </MenuItem>
//             ))}
//           </FormSelect>
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6 }}>
//           <FormInput
//             control={form.control}
//             name="phone"
//             label="Téléphone"
//             extra={{
//               placeholder: "06 12 34 56 78",
//             }}
//           />
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6 }}>
//           <FormInput
//             control={form.control}
//             name="contract_hours"
//             label="Heures de contrat par semaine"
//             extra={{
//               type: "number",
//               helperText: "Nombre d'heures par semaine (défaut: 35h)",
//               inputProps: { min: 1, max: 60 },
//             }}
//           />
//         </Grid>

//         <Grid size={{ xs: 12, sm: 6 }}>
//           <FormInput
//             control={form.control}
//             name="recyclery_id"
//             label="ID Recyclerie"
//             extra={{
//               type: "number",
//               helperText: "ID de la recyclerie (optionnel)",
//             }}
//           />
//         </Grid>
//       </Grid>
//     </form>
//   );
// };
