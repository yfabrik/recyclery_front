import {
  Autocomplete,
  Box,
  TextField,
  type AutocompleteProps,
  type TextFieldProps,
} from "@mui/material";
// import * as MuiIcons from "@mui/icons-material";
// import type { SvgIconComponent } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { SelectedIcon } from "./SelectedIcon";

// const VARIANT_SUFFIXES = ["Outlined", "Rounded", "Sharp", "TwoTone"];

// function isBaseIconName(name: string): boolean {
//   return !VARIANT_SUFFIXES.some((s) => name.endsWith(s));
// }

/** Sorted list of MUI filled (default) icon names only. Exported for use in forms (e.g. CategorieForm). */
// const MUI_ICON_NAMES: string[] = Object.keys(MuiIcons)
//   .filter((key) => isBaseIconName(key))
//   .sort();

export type MuiIconSelectValue = string | null;

/** Normalize value to string | null (handles object from forms / accidental [object Object]) */
function normalizeValue(value: MuiIconSelectValue | unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    for (const key of ["value", "label", "name"] as const) {
      if (typeof o[key] === "string") return o[key] as string;
    }
  }
  return null;
}

export interface MuiIconSelectProps
  extends Omit<
    AutocompleteProps<string, false, false, false>,
    "options" | "renderInput" | "value" | "onChange"
  > {
  value: MuiIconSelectValue;
  onChange: (value: MuiIconSelectValue) => void;
  /** If provided, only these icon names are shown. Otherwise all MUI base icons are used. */
  iconNames?: string[];
  label?: string;
  placeholder?: string;
  TextFieldProps?: Partial<TextFieldProps>;
  showIconInOption?: boolean;
}

/** Renders the selected MUI icon by name (uses the icons map) */
// function SelectedIcon({ iconName }: { iconName: string }) {
//   const IconComponent = (MuiIcons as Record<string, SvgIconComponent>)[iconName];
//   if (!IconComponent) return null;
//   return <IconComponent sx={{ fontSize: 24 }} />;
// }

export function MuiIconSelect({
  value,
  onChange,
  iconNames,
  label = "Icon",
  placeholder = "Choose an icon…",
  TextFieldProps: textFieldProps,
  showIconInOption = true,
  ...autocompleteProps
}: MuiIconSelectProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = normalizeValue(value);

  const options = useMemo(
    () => (iconNames != null ? [...iconNames].sort() : []),
    [iconNames]
  );

  return (
    <Autocomplete<string, false, false, false>
      options={options}
      value={normalizedValue}
      onChange={(_, newValue) => onChange(newValue ?? null)}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      getOptionLabel={(option) => option}
      isOptionEqualToValue={(option, v) => option === v}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          {...textFieldProps}
          slotProps={{
            input: {
              ...params.InputProps,
              ...textFieldProps?.slotProps?.input,
              startAdornment: (<>
                {normalizedValue ? (
                  <Box component="span" sx={{ display: "flex", alignItems: "center", mr: 1 }}>
                    <SelectedIcon iconName={normalizedValue} props={{ sx: { fontSize: 24 } }} />
                  </Box>
                ) : null}
                {params.InputProps.startAdornment}
              </>)
            },

          }}


        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {showIconInOption && (
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 28 }}>
                <SelectedIcon iconName={option} />
              </Box>
            )}
            <span>{option}</span>
          </Box>
        </li>
      )}
      {...autocompleteProps}
    />
  );
}
