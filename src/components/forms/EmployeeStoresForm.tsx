import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import type { BaseFormProps } from "./FormBase";
import type { StoreModel } from "../../interfaces/Models";
import type { EmployeeStoreAssignmentDto } from "@recyclerie/api/responses/employeeStore";
import { Place, Star, Store } from "@mui/icons-material";
import { DevTool } from "@hookform/devtools";
import {
  employeeStoresFormSchema,
  type EmployeeStoresFormOutput,
  type EmployeeStoresFormValues,
} from "../../services/schema/employee";

export type { EmployeeStoresFormValues, EmployeeStoresFormOutput };

type Assignment = EmployeeStoreAssignmentDto;

export const EmployeeStoresForm = ({
  formId,
  onSubmit,
  stores,
  assignments = [],//TODO use as default value
}: BaseFormProps<EmployeeStoresFormValues, EmployeeStoresFormOutput> & {
  stores: StoreModel[];
  assignments?: Assignment[];
}) => {
  const primaryAssignment = assignments.find((a) => a.is_primary);

  const form = useForm<
    EmployeeStoresFormValues,
    unknown,
    EmployeeStoresFormOutput
  >({
    defaultValues: {
      assignedStoreIds: assignments.map((a) => a.id),
      primaryStoreId: primaryAssignment?.id ?? assignments[0]?.id ?? 0,
    },
    resolver: zodResolver(employeeStoresFormSchema),
  });

  return (
    <>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="assignedStoreIds"
          control={form.control}
          render={({ field }) => (
            <Controller
              name="primaryStoreId"
              control={form.control}
              render={({ field: primaryField }) => (
                <RadioGroup
                  {...primaryField}
                  value={String(primaryField.value)}
                  onChange={(e) =>
                    primaryField.onChange(Number(e.target.value))
                  }
                  row
                  sx={{ display: "contents" }}
                >
                  <Grid container spacing={2}>
                    {stores.map((store) => {
                      const assigned = field.value.includes(store.id);
                      return (
                        <Grid
                          size={{ xs: 12, sm: 6, md: 4 }}
                          key={store.id}
                          sx={{ display: "flex", minWidth: 260 }}
                        >
                          <Card
                            sx={{
                              border: assigned
                                ? "2px solid #4caf50"
                                : "1px solid #e0e0e0",
                              bgcolor: assigned ? "#f1f8e9" : "white",
                              "&:hover": {
                                boxShadow: 2,
                                transform: "translateY(-1px)",
                              },
                              width: "100%",
                              minHeight: 160,
                              transition: "all 0.2s",
                              display: "flex",
                              flexDirection: "column",
                              flex: 1,
                            }}
                          >
                            <CardContent
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                                "&:last-child": { pb: 2 },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 2,
                                }}
                              >
                                <Store
                                  sx={{ mr: 1, color: "primary.main", flexShrink: 0 }}
                                />
                                <Typography
                                  variant="h6"
                                  sx={{ flexGrow: 1, minWidth: 0 }}
                                  noWrap
                                >
                                  {store.name}
                                </Typography>
                                {assigned && primaryField.value === store.id && (
                                  <Chip
                                    icon={<Star />}
                                    label="Principal"
                                    color="warning"
                                    size="small"
                                    sx={{ flexShrink: 0 }}
                                  />
                                )}
                              </Box>

                              {store.address && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}
                                  noWrap
                                >
                                  <Place sx={{ fontSize: 16, flexShrink: 0 }} />
                                  {store.address}
                                </Typography>
                              )}

                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "nowrap",
                                  alignItems: "center",
                                  gap: 1.5,
                                  mt: "auto",
                                }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={assigned}
                                      onChange={() => {
                                        const next = assigned
                                          ? field.value.filter(
                                              (id) => id !== store.id
                                            )
                                          : [...field.value, store.id];
                                        field.onChange(next);
                                        // When going from 0 to 1 assigned, set primary to that store
                                        if (
                                          next.length === 1 &&
                                          field.value.length === 0
                                        ) {
                                          primaryField.onChange(next[0]);
                                        }
                                        // When unassigning the primary store, set primary to first remaining or 0
                                        else if (
                                          assigned &&
                                          store.id === primaryField.value
                                        ) {
                                          primaryField.onChange(
                                            next.length > 0 ? next[0] : 0
                                          );
                                        }
                                      }}
                                      onBlur={field.onBlur}
                                      color="primary"
                                    />
                                  }
                                  label="Affecté"
                                  sx={{ flexShrink: 0 }}
                                />

                                {assigned && (
                                  <FormControlLabel
                                    value={String(store.id)}
                                    control={<Radio color="warning" size="small" />}
                                    label="Principal"
                                    sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
                                  />
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </RadioGroup>
              )}
            />
          )}
        />
      </form>
      <DevTool control={form.control} />
    </>
  );
};
