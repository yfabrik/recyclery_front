import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Typography,
  type SxProps,
  type Theme,

} from "@mui/material";
import React, { type ReactNode } from "react";
import type { EmployeeModel, TaskModel } from "../../../interfaces/Models";

// Extended schedule interface with additional fields used in the component
interface Schedule {
  id: number;
  category: string;
  start_time: string;
  end_time: string;
  scheduled_date: Date | string;
  store_name?: string;
  assigned_employees?: (EmployeeModel & { initials?: string })[];
  location_name?: string;
  [key: string]: unknown;
}

interface WeekTaskSectionProps {
  title: string;
  chipLabel: string;
  chipSx?: SxProps<Theme>;
  cardColor: string;
  borderColor: string;
  children?: ReactNode;
}

interface TaskCardProps {
  day: Date;
  cardColor: string;
  dayName: string;
  showAddButton?: boolean;
  onAddClick?: (day: Date) => void;
  emptyText?: string;
  children?: ReactNode;
}

interface TaskCardContentProps {
  schedule: TaskModel;
  getEmployeeColor: (username: string) => string;
  getEmployeeInitials: (username: string) => string;
  handleAssignEmployeesToTask: (schedule: TaskModel) => void;
  handleOpenDialog: (schedule: TaskModel) => void;
  handleDeleteTask: (schedule: TaskModel) => void;
}

interface TaskCardControlsProps {
  handleAssignEmployeesToTask: (schedule: TaskModel) => void;
  handleOpenDialog: (schedule: TaskModel) => void;
  handleDeleteTask: (schedule: TaskModel) => void;
  schedule: TaskModel;
}

interface TaskCss {
  color: string;
  fontSize: string;
  fontWeight: string | number;
  border: string;
  bgColor: string;
}

/**
 * Generic weekly task section (one row of 7 days) used by the week view.
 * Everything is driven by the filterDaySchedules function so the same
 * component can render sales, presence, or normal tasks.
 */
const WeekTaskSection: React.FC<WeekTaskSectionProps> = ({
  title,
  chipLabel,
  chipSx,
  cardColor,
  borderColor,
  children,
}) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          p: 2,
          bgcolor: "#f8f9fa",
          borderRadius: 2,
          border: `2px solid ${borderColor}`,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: cardColor,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {title}
        </Typography>
        <Chip label={chipLabel} size="small" sx={chipSx} />
      </Box>

      <Box
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default WeekTaskSection;

export const TaskCard: React.FC<TaskCardProps> = ({
  day,
  cardColor,
  dayName,
  showAddButton,
  onAddClick,
  emptyText,
  children,
}) => {
  const isToday =
    day instanceof Date && day.toDateString() === new Date().toDateString();
  const hasChildren = React.Children.count(children) > 0;
  return (
    <Card
      sx={{
        minHeight: 200,
        border: "1px solid #e0e0e0",
        bgcolor: isToday ? "#e3f2fd" : "white",
        "&:hover": {
          boxShadow: 2,
          transform: "translateY(-1px)",
        },
        transition: "all 0.2s",
      }}
    >
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: cardColor }}
                textTransform={"capitalize"}
              >
                {dayName}
              </Typography>
              {day && day instanceof Date && (
                <Typography variant="body2" color="text.secondary">
                  {day.getDate()}/{day.getMonth() + 1}
                </Typography>
              )}
            </Box>
            {showAddButton && (
              <IconButton
                size="small"
                onClick={() => onAddClick && onAddClick(day)}
                sx={{
                  bgcolor: cardColor,
                  color: "white",
                  "&:hover": { bgcolor: cardColor },
                }}
              >
                <Add fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      />
      <CardContent sx={{ p: 1 }}>
        <Stack spacing={1}>
          {hasChildren ? (
            children
          ) : (
            <Box
              sx={{
                textAlign: "center",
                py: 3,
                color: "text.secondary",
                border: "2px dashed #e0e0e0",
                borderRadius: 1,
                bgcolor: "#fafafa",
              }}
            >
              <Typography variant="body2">{emptyText}</Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export const TaskCardContent: React.FC<TaskCardContentProps> = ({
  schedule,
  getEmployeeColor,
  getEmployeeInitials,
  handleAssignEmployeesToTask,
  handleOpenDialog,
  handleDeleteTask,
}) => {
  const periode = `${new Date(schedule.start_time).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} - ${new Date(schedule.end_time).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })}`;

  // Fonction pour obtenir le style d'une tâche d'ouverture
  const getOpeningTaskStyle = () => {
    return {
      backgroundColor: "#e8f5e8",
      border: "2px solid #4caf50",
      borderLeft: "4px solid #4caf50",
      "&:hover": {
        backgroundColor: "#d4edda",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(76, 175, 80, 0.3)",
      },
    };
  };

  // Fonction pour obtenir le style de fond des cartes d'ouverture
  const getOpeningCardStyle = () => {
    return {
      backgroundColor: "#f1f8e9",
      border: "1px solid #c8e6c9",
      "&:hover": {
        backgroundColor: "#e8f5e8",
        boxShadow: "0 2px 8px rgba(76, 175, 80, 0.2)",
      },
    };
  };

  // Fonction pour obtenir le style d'une tâche de présence
  const getPresenceTaskStyle = () => {
    return {
      backgroundColor: "#fff3e0",
      border: "2px solid #ff9800",
      borderLeft: "4px solid #ff9800",
      "&:hover": {
        backgroundColor: "#ffe0b2",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 8px rgba(255, 152, 0, 0.3)",
      },
    };
  };

  // Fonction pour obtenir le style de fond des cartes de présence
  const getPresenceCardStyle = () => {
    return {
      backgroundColor: "#fff8e1",
      border: "1px solid #ffcc02",
      "&:hover": {
        backgroundColor: "#fff3e0",
        boxShadow: "0 2px 8px rgba(255, 152, 0, 0.2)",
      },
    };
  };

  const cardstyle = new Map<string, () => Record<string, unknown>>();
  cardstyle.set("vente", getOpeningCardStyle);
  cardstyle.set("point", getPresenceCardStyle);

  const taskstyle = new Map<string, () => Record<string, unknown>>();
  taskstyle.set("vente", getOpeningTaskStyle);
  taskstyle.set("point", getPresenceTaskStyle);

  const css = cardstyle.get(schedule.category)?.() || {};

  // CSS styles for task content based on category
  const cssPresenceTask: TaskCss = {
    color: "#e65100",
    fontSize: "0.7rem",
    fontWeight: "medium",
    border: "1px solid #ffcc02",
    bgColor: "#fff3e0",
  };
  const cssVenteTask: TaskCss = {
    color: "#2e7d32",
    fontSize: "0.65rem",
    fontWeight: "bold",
    border: "1px solid #4caf50",
    bgColor: "#e8f5e8",
  };

  // Map to get the appropriate task CSS based on category
  const taskCssMap = new Map<string, TaskCss>();
  taskCssMap.set("vente", cssVenteTask);
  taskCssMap.set("point", cssPresenceTask);

  // Function to get task CSS based on schedule category
  const getTaskCss = (category: string): TaskCss => {
    return taskCssMap.get(category) || cssVenteTask; // Default to vente if category not found
  };

  const taskCss = getTaskCss(schedule.category);

  return (
    <Card
      sx={{
        p: 1.5,
        ...css,
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{
            color: taskCss.color,
          }}
        >
          {/* {getTaskDisplayName(schedule)} */}
        </Typography>
        <Typography
          variant="caption"
          display="block"
          sx={{ fontWeight: "bold", color: "#2196f3" }}
        >
          🏪 {schedule.name || "Magasin non assigné"}
        
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {periode}
        </Typography>
          {/* //TODO assigned doesnt exist */}
        {schedule.Employees &&
          schedule.Employees.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.3,
                mb: 0.5,
                p: 0.5,
                backgroundColor: taskCss.bgColor,
                borderRadius: 1,
                border: taskCss.border,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: taskCss.color,
                  fontSize: taskCss.fontSize,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                👥 Employés ({schedule?.Employees?.length ||"0"})
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.3,
                  alignItems: "center",
                }}
              >
                {schedule?.Employees?.map((emp, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.3,
                      p: 0.3,
                      bgcolor: "white",
                      borderRadius: 0.5,
                      border: taskCss.border,
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 16,
                        height: 16,
                        fontSize: taskCss.fontSize,
                        bgcolor: getEmployeeColor(emp.fullName),
                        color: "white",
                        fontWeight: "bold",
                      }}
                      title={emp.fullName}
                    >
                      {emp.initials || getEmployeeInitials(emp.fullName)}
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        color: taskCss.color,
                        fontSize: taskCss.fontSize,
                        fontWeight: taskCss.fontWeight,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.fullName}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
      </Box>
      <TaskCardControls
        handleAssignEmployeesToTask={handleAssignEmployeesToTask}
        handleOpenDialog={handleOpenDialog}
        handleDeleteTask={handleDeleteTask}
        schedule={schedule}
      />
    </Card>
  );
};

export const TaskCardControls: React.FC<TaskCardControlsProps> = ({
  handleAssignEmployeesToTask,
  handleOpenDialog,
  handleDeleteTask,
  schedule,
}) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
      <Button
        size="small"
        variant="contained"
        onClick={(e) => {
          e.stopPropagation();
          handleAssignEmployeesToTask(schedule);
        }}
        sx={{
          bgcolor: "#4caf50",
          color: "white",
          fontSize: "0.6rem",
          height: 24,
          minWidth: 60,
          "&:hover": {
            bgcolor: "#45a049",
            transform: "scale(1.05)",
          },
        }}
      >
        +
      </Button>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleOpenDialog(schedule);
        }}
        sx={{
          color: "#2196f3",
          minWidth: 24,
          minHeight: 24,
          width: 24,
          height: 24,
          bgcolor: "rgba(33, 150, 243, 0.1)",
          border: "1px solid rgba(33, 150, 243, 0.3)",
          "&:hover": {
            bgcolor: "#e3f2fd",
            transform: "scale(1.2)",
            border: "1px solid #2196f3",
          },
        }}
      >
        <Edit sx={{ fontSize: 14 }} />
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteTask(schedule);
        }}
        sx={{
          color: "#f44336",
          minWidth: 24,
          minHeight: 24,
          width: 24,
          height: 24,
          bgcolor: "rgba(244, 67, 54, 0.1)",
          border: "1px solid rgba(244, 67, 54, 0.3)",
          "&:hover": {
            bgcolor: "#ffebee",
            transform: "scale(1.2)",
            border: "1px solid #f44336",
          },
        }}
      >
        <Delete sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
};
