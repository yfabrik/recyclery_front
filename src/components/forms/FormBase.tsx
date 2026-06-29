import {
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TextField,
  Typography,
  useRadioGroup,
  useTheme,
  type FormControlOwnProps,
  type SelectProps,
  type TextFieldProps
} from "@mui/material";
import { Category, Visibility, VisibilityOff } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Controller,
  useWatch,
  type Control,
  type ControllerProps,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type SubmitHandler,
  type UseFormSetValue,
} from "react-hook-form";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, type DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { renderTimeViewClock } from "@mui/x-date-pickers/timeViewRenderers";
import dayjs from "dayjs";
import { MuiIconSelect, type MuiIconSelectProps } from "../MuiIconSelect";
import { SelectedIcon } from "../SelectedIcon";
import type { CategoryModel } from "../../interfaces/Models";
import {
  PAYMENT_METHODS,
} from "../../constants/paymentMethods";
import {
  TRANSACTION_TYPES,
} from "../../constants/transactionTypes";
export interface BaseFormProps<T> {
  formId: string;
  defaultValues?: Partial<T> | null;
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

const getFieldErrorMessage = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined;

  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage === "string" && maybeMessage.length > 0) return maybeMessage;

  if (Array.isArray(error)) {
    for (const item of error) {
      const message = getFieldErrorMessage(item);
      if (message) return message;
    }
    return undefined;
  }

  for (const value of Object.values(error as Record<string, unknown>)) {
    const message = getFieldErrorMessage(value);
    if (message) return message;
  }

  return undefined;
};

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

export const FormPasswordInput = <
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
  const [showPassword, setShowPassword] = useState(false);

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
          type={showPassword ? "text" : "password"}
          helperText={fieldState.invalid && fieldState.error?.message}
          error={fieldState.invalid}
          aria-invalid={fieldState.invalid}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                    onClick={() => setShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
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
  extraSelect,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  extra?: FormControlOwnProps;
  extraSelect?: Omit<SelectProps, "value" | "onChange" | "label" | "labelId">;
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
            {...extraSelect}
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
  extra
}: FormControlProps<TFieldValues, TName, TTransformedValues> & { extra?: DatePickerProps }) => {
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
            {...extra}
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

export const FormIconSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  extra,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  extra?: Omit<MuiIconSelectProps, "value" | "onChange">;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <MuiIconSelect
          {...extra}
          label={label}
          value={field.value ?? null}
          onChange={field.onChange}
          TextFieldProps={{
            ...extra?.TextFieldProps,
            fullWidth: true,
            error: fieldState.invalid,
            helperText: fieldState.invalid ? fieldState.error?.message : undefined,
          }}
        />
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


const withMultiSelectCheckboxes = (
  children: ReactNode,
  selectedValues: unknown[],
): ReactNode =>
  Children.map(children, (child) => {
    if (!isValidElement(child)) return child;

    const menuItem = child as ReactElement<{ value?: unknown; children?: ReactNode }>;
    if (menuItem.props.value === undefined) return child;

    const value = menuItem.props.value;
    const checked =
      Array.isArray(selectedValues) && selectedValues.includes(value);

    return cloneElement(menuItem, {
      children: (
        <>
          <Checkbox checked={checked} />
          {menuItem.props.children}
        </>
      ),
    });
  });

export const FormMultiSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  children,
  extra,
  renderValue,
  showCheckboxes = false,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  extra?: FormControlOwnProps;
  renderValue?: (selected: FieldPathValue<TFieldValues, TName>) => ReactNode;
  /** Prepends a read-only checkbox to each MenuItem (ListSubheader etc. unchanged). */
  showCheckboxes?: boolean;
}) => {
  const labelId = `${name}-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const errorMessage = getFieldErrorMessage(fieldState.error);
        const selectChildren = showCheckboxes
          ? withMultiSelectCheckboxes(children, field.value ?? [])
          : children;

        return (
          <FormControl fullWidth error={fieldState.invalid} {...extra}>
            <InputLabel id={labelId} shrink>
              {label}
            </InputLabel>
            <Select
              multiple
              labelId={labelId}
              label={label}
              renderValue={renderValue}
              {...field}
              displayEmpty
              error={fieldState.invalid}
            >
              {selectChildren}
            </Select>
            {fieldState.invalid && errorMessage && (
              <FormHelperText>{errorMessage}</FormHelperText>
            )}
          </FormControl>
        );
      }}
    />
  );
};

export interface FormCheckboxGroupOption {
  value: string | number;
  label: string;
}

export const FormCheckboxGroup = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  name,
  control,
  label,
  options,
  extra,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  options: FormCheckboxGroupOption[];
  extra?: FormControlOwnProps;
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const value: (number | string)[] = Array.isArray(field.value) ? field.value : [];
        const toggle = (optionValue: number | string) => {
          const next = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue];
          field.onChange(next);
        };
        return (
          <FormControl component="fieldset" variant="standard" fullWidth {...extra}>
            <FormLabel component="legend">{label}</FormLabel>
            <FormGroup>
              {options.map((opt) => (
                <FormControlLabel
                  key={opt.value}
                  control={
                    <Checkbox
                      checked={value.includes(opt.value)}
                      onChange={() => toggle(opt.value)}
                      name={opt.value.toString()}
                    />
                  }
                  label={opt.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        );
      }}
    />
  );
};

export const FormPaymentMethodSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  allLabel = "Tous les types de paiement",
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  allLabel?: string;
}) => (
  <FormSelect control={control} name={name} label={label}>
    <MenuItem value="">{allLabel}</MenuItem>
    {PAYMENT_METHODS.map((method) => (
      <MenuItem key={method.value} value={method.value}>
        {method.label}
      </MenuItem>
    ))}
  </FormSelect>
);

export const FormTransactionTypeSelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name,
  label,
  allLabel = "Tous les types de transactions",
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  allLabel?: string;
}) => (
  <FormSelect control={control} name={name} label={label}>
    <MenuItem value="">{allLabel}</MenuItem>
    {TRANSACTION_TYPES.map((type) => (
      <MenuItem key={type.value} value={type.value}>
        {type.label}
      </MenuItem>
    ))}
  </FormSelect>
);

const CategoryOptionLabel = ({
  category,
  showIcons = true,
}: {
  category: CategoryModel;
  showIcons?: boolean;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
    {showIcons &&
      (category.icon ? (
        <SelectedIcon iconName={category.icon || "Category"} />
      ) : (
        <Category fontSize="small" />
      ))}
    {category.name}
  </Box>
);

type CategoryFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TCategoryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSubcategoryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = {
  control: Control<TFieldValues, unknown, TTransformedValues>;
  categories: CategoryModel[];
  categoryFieldName?: TCategoryName;
  subcategoryFieldName?: TSubcategoryName;
  categoryLabel?: string;
  subcategoryLabel?: string;
  showIcons?: boolean;
  setValue?: UseFormSetValue<TFieldValues>;
};

export const FormCategorySelect = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  name = "category_id" as TName,
  label = "Catégorie",
  categories,
  showIcons = true,
  emptyOption,
  filterCategories,
  extra,
}: FormControlProps<TFieldValues, TName, TTransformedValues> & {
  categories: CategoryModel[];
  showIcons?: boolean;
  emptyOption?: { value: string | number; label: string };
  filterCategories?: (cat: CategoryModel) => boolean;
  extra?: FormControlOwnProps;
}) => {
  const visibleCategories = filterCategories
    ? categories.filter(filterCategories)
    : categories;

  return (
    <FormSelect control={control} name={name} label={label} extra={extra}>
      {emptyOption && (
        <MenuItem value={emptyOption.value}>{emptyOption.label}</MenuItem>
      )}
      {visibleCategories.map((category) => (
        <MenuItem key={category.id} value={category.id}>
          <CategoryOptionLabel category={category} showIcons={showIcons} />
        </MenuItem>
      ))}
    </FormSelect>
  );
};

export const FormSubcategorySelect = <
  TFieldValues extends FieldValues = FieldValues,
  TCategoryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSubcategoryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  categories,
  categoryFieldName = "category_id" as TCategoryName,
  subcategoryFieldName = "subcategory_id" as TSubcategoryName,
  label = "Sous-catégorie",
  showIcons = true,
  hideWhenEmpty = true,
  resetOnCategoryChange = true,
  resetInvalidSelection = true,
  emptyOptionLabel = "Aucune",
  setValue,
}: CategoryFieldProps<
  TFieldValues,
  TCategoryName,
  TSubcategoryName,
  TTransformedValues
> & {
  label?: string;
  hideWhenEmpty?: boolean;
  resetOnCategoryChange?: boolean;
  resetInvalidSelection?: boolean;
  emptyOptionLabel?: string;
}) => {
  const categoryId = useWatch({ control, name: categoryFieldName });
  const subcategoryId = useWatch({ control, name: subcategoryFieldName });
  const subcats = useMemo(
    () => categories.find((c) => c.id == categoryId)?.subcategories ?? [],
    [categories, categoryId],
  );
  const prevCategoryRef = useRef<
    FieldPathValue<TFieldValues, TCategoryName> | undefined
  >(undefined);

  useEffect(() => {
    if (!setValue || !resetOnCategoryChange) return;
    if (
      prevCategoryRef.current !== undefined &&
      prevCategoryRef.current !== categoryId
    ) {
      setValue(
        subcategoryFieldName,
        "" as FieldPathValue<TFieldValues, TSubcategoryName>,
      );
    }
    prevCategoryRef.current = categoryId;
  }, [
    categoryId,
    setValue,
    resetOnCategoryChange,
    subcategoryFieldName,
  ]);

  useEffect(() => {
    if (!setValue || !resetInvalidSelection) return;
    const hasValidSubcategory =
      subcategoryId === "" ||
      subcategoryId == null ||
      subcats.some((cat) => String(cat.id) === String(subcategoryId));
    if (!hasValidSubcategory) {
      setValue(
        subcategoryFieldName,
        "" as FieldPathValue<TFieldValues, TSubcategoryName>,
      );
    }
  }, [subcategoryId, subcats, setValue, resetInvalidSelection, subcategoryFieldName]);

  const hasValidSubcategory =
    subcategoryId === "" ||
    subcategoryId == null ||
    subcats.some((cat) => String(cat.id) === String(subcategoryId));

  if (hideWhenEmpty && (subcats.length === 0 || !hasValidSubcategory)) {
    return null;
  }

  return (
    <FormSelect
      control={control}
      name={subcategoryFieldName}
      label={label}
      extra={{ disabled: subcats.length < 1 }}
    >
      <MenuItem value="">{emptyOptionLabel}</MenuItem>
      {subcats.map((cat) => (
        <MenuItem key={cat.id} value={cat.id}>
          <CategoryOptionLabel category={cat} showIcons={showIcons} />
        </MenuItem>
      ))}
    </FormSelect>
  );
};

export const FormCategorySubcategoryFields = <
  TFieldValues extends FieldValues = FieldValues,
  TCategoryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TSubcategoryName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>({
  control,
  categories,
  setValue,
  gridSize = { xs: 12, md: 6 },
  categoryFieldName = "category_id" as TCategoryName,
  subcategoryFieldName = "subcategory_id" as TSubcategoryName,
  categoryLabel = "Catégorie",
  subcategoryLabel = "Sous-catégorie",
  showIcons = true,
  hideWhenEmpty = true,
  resetOnCategoryChange = true,
  resetInvalidSelection = true,
  emptyOptionLabel = "Aucune",
  categoryEmptyOption,
  filterCategories,
  categoryExtra,
}: CategoryFieldProps<
  TFieldValues,
  TCategoryName,
  TSubcategoryName,
  TTransformedValues
> & {
  gridSize?: { xs?: number; sm?: number; md?: number; lg?: number };
  hideWhenEmpty?: boolean;
  resetOnCategoryChange?: boolean;
  resetInvalidSelection?: boolean;
  emptyOptionLabel?: string;
  categoryEmptyOption?: { value: string | number; label: string };
  filterCategories?: (cat: CategoryModel) => boolean;
  categoryExtra?: FormControlOwnProps;
}) => (
  <>
    <Grid size={gridSize}>
      <FormCategorySelect
        control={control}
        name={categoryFieldName}
        label={categoryLabel}
        categories={categories}
        showIcons={showIcons}
        emptyOption={categoryEmptyOption}
        filterCategories={filterCategories}
        extra={categoryExtra}
      />
    </Grid>
    <Grid size={gridSize}>
      <FormSubcategorySelect
        control={control}
        categories={categories}
        setValue={setValue}
        categoryFieldName={categoryFieldName}
        subcategoryFieldName={subcategoryFieldName}
        label={subcategoryLabel}
        showIcons={showIcons}
        hideWhenEmpty={hideWhenEmpty}
        resetOnCategoryChange={resetOnCategoryChange}
        resetInvalidSelection={resetInvalidSelection}
        emptyOptionLabel={emptyOptionLabel}
      />
    </Grid>
  </>
);
