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
import type { EmployeeModel, StoreModel } from "../../interfaces/Models";

interface EmployeesDay {
  label: string;
  morning: EmployeeModel[];
  afternoon: EmployeeModel[];
  allDay: EmployeeModel[];
}
interface PresenceEmployeesProps {
  selectedStore: StoreModel | null;
  setShowMissingEmployeesDialog: (open: boolean) => void;
  loadingEmployeesPresent: boolean;
  EmployeeByDay:()=> { [key: string]: EmployeesDay };
}

export const PrecenseEmployees = ({
  selectedStore,
  setShowMissingEmployeesDialog,
  loadingEmployeesPresent,
  EmployeeByDay,
}: PresenceEmployeesProps) => {
  const a= EmployeeByDay()
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

                <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                  Magasin sélectionné:{" "}
                  {selectedStore?.name || "Magasin inconnu"}
                </Typography>
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
            <ListDays
              EmployeeByDay={a}
              selectedStore={selectedStore}
            ></ListDays>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

interface listDaysProps {
  EmployeeByDay?: { [key: string]: EmployeesDay };
  selectedStore: StoreModel | null;
}
export const ListDays = ({ EmployeeByDay, selectedStore }: listDaysProps) => {
  if (!EmployeeByDay)
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Aucun employé trouvé
        </Typography>
        <Typography variant="body2" color="text.secondary">
          vérifiez les affectations d'employés.
        </Typography>
      </Box>
    );
  const hasEmployees = Object.values(EmployeeByDay).some(
    (day) =>
      day.morning.length > 0 ||
      day.afternoon.length > 0 ||
      day.allDay.length > 0,
  );
  if (!hasEmployees && selectedStore) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Aucun employé trouvé pour ce magasin
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez un autre magasin ou vérifiez les affectations d'employés.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {Object.entries(EmployeeByDay).map(([dayKey, dayData]) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 1.7 }} key={dayKey}>
          <Card
            sx={{
              height: "100%",
              border: "1px solid #e0e0e0",
              bgcolor: dayData.allDay.length > 0 ? "#e8f5e8" : "#f5f5f5",
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
                <Typography variant="caption" color="text.secondary">
                  {dayData.allDay.length} employé
                  {dayData.allDay.length > 1 ? "s" : ""}
                </Typography>
              </Box>

              {dayData.allDay.length > 0 ? (
                <Stack spacing={1}>
                  <EmployeeThisDay dayData={dayData}></EmployeeThisDay>
                </Stack>
              ) : (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Aucun employé
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export const EmployeeThisDay = ({ dayData }: { dayData: EmployeesDay }) => {
  // Helper function to deduplicate employees by id
  // const deduplicateEmployees = (employees: EmployeesDay[]): EmployeesDay[] => {
  //   const seen = new Set<number | string>();
  //   return employees.filter((employee: EmployeesDay) => {
  //     if (seen.has(employee.id)) {
  //       return false;
  //     }
  //     seen.add(employee.id);
  //     return true;
  //   });
  // };
  // console.log("dayData", dayData);

  // const allDayEmployees = deduplicateEmployees(
  //   dayData.allDay.filter((employee: Employee) => {
  //     const worksMorning = dayData.morning.some(
  //       (emp: Employee) => emp.id === employee.id,
  //     );
  //     const worksAfternoon = dayData.afternoon.some(
  //       (emp: Employee) => emp.id === employee.id,
  //     );
  //     return worksMorning && worksAfternoon;
  //   }),
  // );

  // const morningOnlyEmployees = deduplicateEmployees(
  //   dayData.morning.filter(
  //     (employee: Employee) =>
  //       !dayData.afternoon.some((emp: Employee) => emp.id === employee.id),
  //   ),
  // );

  // const afternoonOnlyEmployees = deduplicateEmployees(
  //   dayData.afternoon.filter(
  //     (employee: Employee) =>
  //       !dayData.morning.some((emp: Employee) => emp.id === employee.id),
  //   ),
  // );

  return (
    <>
      {/* Toute la journée */}
      {dayData.allDay.length > 0 && (
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
          {dayData.allDay.map((employee: EmployeeModel, index: number) => (
            <ShowEmployee
              employee={employee}
              key={`${employee.id}-allday-${index}`}
            />
          ))}
        </Box>
      )}

      {/* Matin seulement */}
      {dayData.morning.length > 0 && (
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
          {dayData.morning.map((employee: EmployeeModel, index: number) => (
            <ShowEmployee
              employee={employee}
              key={`${employee.id}-morning-${index}`}
            />
          ))}
        </Box>
      )}

      {/* Après-midi seulement */}
      {dayData.afternoon.length > 0 && (
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
          {dayData.afternoon.map((employee: EmployeeModel, index: number) => (
            <ShowEmployee
              employee={employee}
              key={`${employee.id}-afternoon-${index}`}
            />
          ))}
        </Box>
      )}
    </>
  );
};

interface ShowEmployeeProps {
  employee: EmployeeModel;
}
const ShowEmployee = ({ employee }: ShowEmployeeProps) => {
  return (
    <Box
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
        <Person sx={{ fontSize: 12 }} />
      </Avatar>
      <Typography
        variant="caption"
        sx={{
          fontSize: "0.7rem",
          fontWeight: "medium",
        }}
      >
        {employee.fullName}
      </Typography>
    </Box>
  );
};
