import { useForm } from "react-hook-form"
import { FormInput, type BaseFormProps } from "./FormBase"
import z from "zod"
import { noEmptyStr } from "../../interfaces/ZodTypes"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
    currentPassword: noEmptyStr("champ requis"),
    newPassword: noEmptyStr("champ requis").min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: noEmptyStr("champ requis").min(6, "Le mot de passe doit contenir au moins 6 caractères"),
}).refine((v) => v.confirmPassword == v.newPassword,
    {
        message: "les champs doivent etre egaux",
        path: ["newPassword"]//FIXME ça montre pas les fields


    })

export type Schema = z.infer<typeof schema>

export const PasswordChangeForm = ({ formId, onSubmit }: BaseFormProps<Schema>) => {

    const form = useForm({
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        },
        resolver: zodResolver(schema)
    })
    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <FormInput control={form.control} name="currentPassword" label="Mot de passe actuel" extra={{
                margin: "normal",
                type: "password"
            }} />

            <FormInput control={form.control} name="newPassword" label="Nouveau mot de passe" extra={{
                margin: "normal",
                type: "password"
            }} />
            <FormInput control={form.control} name="confirmPassword" label="Confirmer le nouveau mot de passe" extra={{
                margin: "normal",
                type: "password"
            }} />
        </form>


    )
}