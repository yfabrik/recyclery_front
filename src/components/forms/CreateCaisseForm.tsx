import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button } from "@mui/material";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { noEmptyStr } from "../../interfaces/ZodTypes";
import {
    FormInput,
    type BaseFormProps
} from "./FormBase";


const schema = z.object({
    name: noEmptyStr("nom requis"),
});

export type Schema = z.infer<typeof schema>;

export const CreateCaisseForm = ({
    formId,
    onSubmit,
}: BaseFormProps<Schema>) => {
    const form = useForm({
        defaultValues: {
            name: "",
        },
        resolver: zodResolver(schema),
    });

    const name = form.watch("name")

    return (
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
            <Box sx={{ mb: 2, mt: 2 }}>
                <FormInput control={form.control} label="Nom de la nouvelle caisse" name="name" extra={{
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
                    }
                }} />

            </Box>
        </form>
    );
};
