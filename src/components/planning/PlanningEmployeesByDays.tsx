/***
 * @deprecated maybe ?
 */
import { CalendarToday, Person, Warning } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
/***
 * @deprecated maybe ?
 */
export const PlanningEmployeesBydays = () => {
  return (
    <Box sx={{ mb: 3 }}>
      <Card sx={{ bgcolor: "#f8f9fa", border: "2px solid #e0e0e0" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday sx={{ color: "#2196f3", fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#2196f3" }}
                >
                  Planning des Employés par Jour
                </Typography>
                {selectedStore && (
                  <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                    Magasin sélectionné:{" "}
                    {stores.find((s) => s.id === parseInt(selectedStore))
                      ?.name || "Magasin inconnu"}
                  </Typography>
                )}
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Warning />}
              onClick={() => setShowMissingEmployeesDialog(true)}
              sx={{
                borderColor: "#ff9800",
                color: "#ff9800",
                "&:hover": {
                  borderColor: "#ff9800",
                  backgroundColor: "#fff3e0",
                },
              }}
            >
              Vérifier les employés manquants
            </Button>
          </Box>

          {loadingEmployeesPresent ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Chargement des employés...</Typography>
            </Box>
          ) : (
            (() => {
              const employeesByDay = getEmployeesByDay();
              const hasEmployees = Object.values(employeesByDay).some(
                (day) =>
                  day.morning.length > 0 ||
                  day.afternoon.length > 0 ||
                  day.allDay.length > 0
              );

              if (!hasEmployees && selectedStore) {
                return (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Aucun employé trouvé pour ce magasin
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sélectionnez un autre magasin ou vérifiez les affectations
                      d'employés.
                    </Typography>
                  </Box>
                );
              }

              return (
                <Grid container spacing={2}>
                  {Object.entries(getEmployeesByDay()).map(
                    ([dayKey, dayData]) => (
                      <Grid
                        size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }}
                        key={dayKey}
                      >
                        <Card
                          sx={{
                            height: "100%",
                            border: "1px solid #e0e0e0",
                            bgcolor:
                              dayData.allDay.length > 0 ? "#e8f5e8" : "#f5f5f5",
                            "&:hover": { boxShadow: 2 },
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ textAlign: "center", mb: 2 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                sx={{ color: "#333" }}
                              >
                                {dayData.label}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {dayData.allDay.length} employé
                                {dayData.allDay.length > 1 ? "s" : ""}
                              </Typography>
                            </Box>

                            {dayData.allDay.length > 0 ? (
                              <Stack spacing={1}>
                                {/* Employés travaillant toute la journée */}
                                {(() => {
                                  const allDayEmployees = dayData.allDay.filter(
                                    (employee) => {
                                      const worksMorning = dayData.morning.some(
                                        (emp) => emp.id === employee.id
                                      );
                                      const worksAfternoon =
                                        dayData.afternoon.some(
                                          (emp) => emp.id === employee.id
                                        );
                                      return worksMorning && worksAfternoon;
                                    }
                                  );

                                  const morningOnlyEmployees =
                                    dayData.morning.filter(
                                      (employee) =>
                                        !dayData.afternoon.some(
                                          (emp) => emp.id === employee.id
                                        )
                                    );

                                  const afternoonOnlyEmployees =
                                    dayData.afternoon.filter(
                                      (employee) =>
                                        !dayData.morning.some(
                                          (emp) => emp.id === employee.id
                                        )
                                    );

                                  return (
                                    <>
                                      {/* Toute la journée */}
                                      {allDayEmployees.length > 0 && (
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            sx={{
                                              color: "#4caf50",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.5,
                                            }}
                                          >
                                            🌞 Journée
                                          </Typography>
                                          {allDayEmployees.map((employee) => (
                                            <Box
                                              key={`${employee.id}-allday`}
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                mt: 0.5,
                                              }}
                                            >
                                              <Avatar
                                                sx={{
                                                  width: 20,
                                                  height: 20,
                                                  bgcolor: "#4caf50",
                                                  fontSize: 10,
                                                }}
                                              >
                                                <Person sx={{ fontSize: 12 }} />
                                              </Avatar>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontSize: "0.7rem",
                                                  fontWeight: "bold",
                                                }}
                                              >
                                                {employee.name}
                                              </Typography>
                                            </Box>
                                          ))}
                                        </Box>
                                      )}

                                      {/* Matin seulement */}
                                      {morningOnlyEmployees.length > 0 && (
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            sx={{
                                              color: "#ff9800",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.5,
                                            }}
                                          >
                                            🌅 Matin
                                          </Typography>
                                          {morningOnlyEmployees.map(
                                            (employee) => (
                                              <Box
                                                key={`${employee.id}-morning`}
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 0.5,
                                                  mt: 0.5,
                                                }}
                                              >
                                                <Avatar
                                                  sx={{
                                                    width: 20,
                                                    height: 20,
                                                    bgcolor: "#ff9800",
                                                    fontSize: 10,
                                                  }}
                                                >
                                                  <Person
                                                    sx={{ fontSize: 12 }}
                                                  />
                                                </Avatar>
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    fontSize: "0.7rem",
                                                    fontWeight: "medium",
                                                  }}
                                                >
                                                  {employee.name}
                                                </Typography>
                                              </Box>
                                            )
                                          )}
                                        </Box>
                                      )}

                                      {/* Après-midi seulement */}
                                      {afternoonOnlyEmployees.length > 0 && (
                                        <Box>
                                          <Typography
                                            variant="caption"
                                            fontWeight="bold"
                                            sx={{
                                              color: "#2196f3",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 0.5,
                                            }}
                                          >
                                            🌆 Après-midi
                                          </Typography>
                                          {afternoonOnlyEmployees.map(
                                            (employee) => (
                                              <Box
                                                key={`${employee.id}-afternoon`}
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 0.5,
                                                  mt: 0.5,
                                                }}
                                              >
                                                <Avatar
                                                  sx={{
                                                    width: 20,
                                                    height: 20,
                                                    bgcolor: "#2196f3",
                                                    fontSize: 10,
                                                  }}
                                                >
                                                  <Person
                                                    sx={{ fontSize: 12 }}
                                                  />
                                                </Avatar>
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    fontSize: "0.7rem",
                                                    fontWeight: "medium",
                                                  }}
                                                >
                                                  {employee.name}
                                                </Typography>
                                              </Box>
                                            )
                                          )}
                                        </Box>
                                      )}
                                    </>
                                  );
                                })()}
                              </Stack>
                            ) : (
                              <Box sx={{ textAlign: "center", py: 2 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Aucun employé
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  )}
                </Grid>
              );
            })()
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
