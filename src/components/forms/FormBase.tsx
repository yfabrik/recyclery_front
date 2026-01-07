import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Select,
  Switch,
  TextField,
  type FormControlOwnProps,
  type TextFieldProps,
} from "@mui/material";
import type { ReactNode } from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs from "dayjs";
export interface BaseFormProps<T> {
  formId: string;
  defaultValues?: T;
  onSubmit: SubmitHandler<T>;
}

interface FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> {
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"];
  name: TName;
  label: string;
  children?: ReactNode;
}

export const FormInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  extra,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  extra?: TextFieldProps;
}) => {
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
  );
};

export const FormSwitch = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
}: FormControlProps<TFieldValues, TName, TTransformedValues>) => {
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
  );
};

export const FormSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  children,
  extra,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  extra?: FormControlOwnProps;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth {...extra} error={fieldState.invalid}>
          <InputLabel id={`${name}_label`}>{label}</InputLabel>
          <Select
            labelId={`${name}_label`}
            label={label}
            {...field}
            error={fieldState.invalid}
          >
            {children}
          </Select>
          {fieldState.invalid && (
            <FormHelperText>{fieldState.error?.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

export const FormDate = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
}: FormControlProps<TFieldValues, TName, TTransformedValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={label}
            slotProps={{
              textField: {
                fullWidth:true,
                error: fieldState.invalid,
                helperText: fieldState.invalid && fieldState.error?.message,
              },
            }}
            {...field}
            value={field.value ? dayjs(field.value) : null}
            onChange={(value) => field.onChange(value ? value.toDate() : null)}
          />
        </LocalizationProvider>
      )}
    />
  );
};

export const FormTime = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
}: FormControlProps<TFieldValues, TName, TTransformedValues>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label={label}
            ampm={false}
            viewRenderers={{
              hours: renderTimeViewClock,
              minutes: renderTimeViewClock,
            }}
            slotProps={{
              textField: {
                error: fieldState.invalid,
                helperText: fieldState.invalid && fieldState.error?.message,
                fullWidth: true,
              },
            }}
            {...field}
            value={field.value ? dayjs(field.value) : null}
            onChange={(value) => field.onChange(value ? value.toDate() : null)}
          />
        </LocalizationProvider>
      )}
    />
  );
};
