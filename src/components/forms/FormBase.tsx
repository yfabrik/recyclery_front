import { FormControl, FormControlLabel, FormHelperText, InputLabel, Select, Switch, TextField } from "@mui/material"
import type { ReactNode } from "react"
import { Controller, type ControllerProps, type FieldPath, type FieldValues, type SubmitHandler } from "react-hook-form"

export interface BaseFormProps<T> {
    formId: string;
    defaultValues?: T
    onSubmit: SubmitHandler<T>;
}


interface FormControlProps<TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues = TFieldValues> {
    control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"]
    name: TName
    label: string
    children?: ReactNode
    extra?: {}
}


export const FormInput = <TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues = TFieldValues>({ name, control, label, extra }: FormControlProps<TFieldValues, TName, TTransformedValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <TextField
                    fullWidth
                    label={label}
                    {...field}
                    {...extra}
                    helperText={fieldState.invalid && fieldState.error?.message}
                    error={fieldState.invalid}
                    aria-invalid={fieldState.invalid}


                />
            )}
        />
    )
}

export const FormSwitch = <TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues = TFieldValues>({ name, control, label }: FormControlProps<TFieldValues, TName, TTransformedValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field }) => (
                <FormControlLabel
                    control={
                        <Switch
                            {...field}
                            checked={field.value}
                            // onChange={field.onChange}
                        />
                    }
                    label={label}
                />
            )}
        />
    )
}

export const FormSelect = <TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
    TTransformedValues = TFieldValues>({ name, control, label, children }: FormControlProps<TFieldValues, TName, TTransformedValues>) => {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field,fieldState }) => (
                <FormControl fullWidth>
                    <InputLabel id={`${name}_label`}>{label}</InputLabel>
                    <Select
                        labelId={`${name}_label`}
                        label={label}
                        {...field}
                        error={fieldState.invalid}
                    >
                        {children}

                    </Select>
                    {fieldState.invalid && <FormHelperText>{fieldState.error?.message}</FormHelperText> }
                </FormControl>

            )}
        />
    )
}