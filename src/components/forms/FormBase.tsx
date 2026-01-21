import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
  useRadioGroup,
  useTheme,
  type FormControlOwnProps,
  type TextFieldProps,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
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
  control: ControllerProps<TFieldValues, TName, TTransformedValues>["control"]; //Control<TFieldValues>
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
          <InputLabel id={`${name}_label`} shrink>
            {label}
          </InputLabel>
          <Select
            labelId={`${name}_label`}
            label={label}
            {...field}
            displayEmpty
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
                fullWidth: true,
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

export const FormRadio = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  extra,
  children,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  extra?: FormControlOwnProps;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl error={fieldState.invalid} fullWidth {...extra}>
          <FormLabel id={name}>{label}</FormLabel>
          <RadioGroup aria-labelledby={name} {...field}>
            {children}
          </RadioGroup>
          {fieldState.invalid && (
            <FormHelperText>{fieldState.error?.message}</FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};

interface FormRadioCardProps {
  value: string;
  label: string;
  icon?: ReactNode;
}
export const FormRadioCard = ({ value, label, icon }: FormRadioCardProps) => {
  const radioGroup = useRadioGroup();
  const theme = useTheme();
  const isSelected = radioGroup?.value === value;

  return (
    <Box
      sx={{
        position: "relative",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <FormControlLabel
        value={value}
        control={
          <Radio
            sx={{
              position: "absolute",
              opacity: 0,
              width: 0,
              height: 0,
              margin: 0,
              pointerEvents: "none",
            }}
          />
        }
        label=""
        sx={{
          margin: 0,
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 2,
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
      />
      <Card
        sx={{
          cursor: "pointer",
          border: isSelected
            ? `2px solid ${theme.palette.primary.main}`
            : `1px solid ${theme.palette.divider}`,
          backgroundColor: isSelected
            ? alpha(theme.palette.primary.main, 0.1)
            : theme.palette.background.paper,
          minHeight: 100,
          width: "100%",
          position: "relative",
          zIndex: 1,
          pointerEvents: "none",
        }}
      >
        <CardContent sx={{ textAlign: "center" }}>
          {icon && (
            <Box
              sx={{
                color: isSelected
                  ? theme.palette.primary.main
                  : "text.secondary",
                mb: 1,
              }}
            >
              {icon}
            </Box>
          )}
          <Typography
            variant="body1"
            fontWeight={isSelected ? "bold" : "normal"}
          >
            {label}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
