import { zodResolver } from "@hookform/resolvers/zod";
import { RestartAlt } from "@mui/icons-material";
import { Box, Button, Grid, IconButton, MenuItem, Tooltip } from "@mui/material";
import { useEffect } from "react";
import { useForm, type UseFormReset } from "react-hook-form";
import { VACATION_REASONS } from "../../constants/vacationReasons";
import {
  VACATION_FORM_DEFAULTS,
  vacationFormSchema,
  type VacationFormOutput,
  type VacationFormValues,
} from "../../services/schema/vacation";
import { FormDate, FormSelect, type BaseFormProps } from "./FormBase";

export type { VacationFormOutput, VacationFormValues };

type VacationFormProps = BaseFormProps<
  VacationFormValues,
  VacationFormOutput
> & {
  onReady?: (methods: { reset: UseFormReset<VacationFormValues> }) => void;
  onReset?: () => void;
};

export const VacationForm = ({
  onSubmit,
  formId,
  onReady,
  onReset,
}: VacationFormProps) => {
  const form = useForm<VacationFormValues, unknown, VacationFormOutput>({
    resolver: zodResolver(vacationFormSchema),
    defaultValues: VACATION_FORM_DEFAULTS,
  });

  const reset = form.reset;
  useEffect(() => {
    onReady?.({ reset });
  }, [onReady, reset]);

  const handleReset = () => {
    form.reset(VACATION_FORM_DEFAULTS);
    onReset?.();
  };

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit, () =>
        console.error(form.formState.errors),
      )}
    >
      <Grid container spacing={2} alignItems="flex-end">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormDate
            control={form.control}
            name="start_date"
            label="Date de début (inclus)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormDate
            control={form.control}
            name="end_date"
            label="Date de fin (inclus)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormSelect control={form.control} name="reason" label="Motif">
            <MenuItem value="">
              <em>Choisir…</em>
            </MenuItem>
            {VACATION_REASONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </FormSelect>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              sx={{ height: (theme) => theme.spacing(7) }}
            >
              Enregistrer
            </Button>
            <Tooltip title="Réinitialiser">
              <IconButton
                type="button"
                aria-label="Réinitialiser"
                onClick={handleReset}
                sx={{
                  height: (theme) => theme.spacing(7),
                  width: (theme) => theme.spacing(7),
                }}
              >
                <RestartAlt />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};
