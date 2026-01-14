import React from "react";
import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

/**
 * Collection row (one row of 7 days) combining collection_schedules and
 * collection tasks from the general planning.
 */
const WeekCollectionSection = ({
  title,
  chipLabel,
  chipSx,
  weekDays,
  collections,
  filteredSchedules,
  // isCollectionTask,
  // getTaskDisplayName,
  // formatTime,
  handleAssignEmployeesToCollection,
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
          border: "2px solid #9c27b0",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#9c27b0",
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
        {weekDays.map((day, index) => {
          const dayCollections = Array.isArray(collections)
            ? collections.filter((collection) => {
                const collectionDate = new Date(collection.scheduled_date);
                return (
                  collectionDate.getDate() === day.getDate() &&
                  collectionDate.getMonth() === day.getMonth() &&
                  collectionDate.getFullYear() === day.getFullYear()
                );
              })
            : [];

          const dayCollectionTasks = Array.isArray(filteredSchedules)
            ? filteredSchedules.filter((schedule) => {
                const scheduleDate = new Date(schedule.scheduled_date);
                return (
                  scheduleDate.getDate() === day.getDate() &&
                  scheduleDate.getMonth() === day.getMonth() &&
                  scheduleDate.getFullYear() === day.getFullYear()
                  // isCollectionTask(schedule)
                );
              })
            : [];

          return (
            <Card
              key={index}
              sx={{
                minHeight: 200,
                border: "1px solid #e0e0e0",
                bgcolor:
                  day.toDateString() === new Date().toDateString()
                    ? "#e3f2fd"
                    : "white",
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
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: "bold", color: "#9c27b0" }}
                    >
                      {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                    </Typography>
                  </Box>
                }
              />
              <CardContent sx={{ p: 1 }}>
                <Stack spacing={1}>
                  {/* Collection schedules */}
                  {dayCollections.map((collection, collectionIndex) => (
                    <Card
                      key={`collection-${collectionIndex}`}
                      sx={{
                        p: 1,
                        bgcolor: "#f3e5f5",
                        border: "1px solid #e1bee7",
                        "&:hover": {
                          bgcolor: "#e8d5f2",
                          transform: "translateY(-1px)",
                          boxShadow: "0 2px 4px rgba(156, 39, 176, 0.2)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "bold", color: "#9c27b0" }}
                      >
                        🚚 {collection.collection_point_name}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "#666" }}
                      >
                        {collection.collection_point_city ||
                          "Ville non définie"}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "#666", mb: 1 }}
                      >
                        {collection.scheduled_time}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {collection.employee_name && (
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {collection.employee_name}
                            </Typography>
                          )}
                          {!collection.employee_name && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssignEmployeesToCollection(collection);
                              }}
                              sx={{
                                bgcolor: "#9c27b0",
                                color: "white",
                                fontSize: "0.6rem",
                                height: 16,
                                minWidth: 40,
                                "&:hover": {
                                  bgcolor: "#7b1fa2",
                                  transform: "scale(1.05)",
                                },
                              }}
                            >
                              +
                            </Button>
                          )}
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              color: "#2196f3",
                              minWidth: 20,
                              minHeight: 20,
                              width: 20,
                              height: 20,
                              bgcolor: "rgba(33, 150, 243, 0.1)",
                              border: "1px solid rgba(33, 150, 243, 0.3)",
                              "&:hover": {
                                bgcolor: "#e3f2fd",
                                transform: "scale(1.2)",
                                border: "1px solid #2196f3",
                              },
                            }}
                          >
                            <Edit sx={{ fontSize: 12 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={{
                              color: "#f44336",
                              minWidth: 20,
                              minHeight: 20,
                              width: 20,
                              height: 20,
                              bgcolor: "rgba(244, 67, 54, 0.1)",
                              border: "1px solid rgba(244, 67, 54, 0.3)",
                              "&:hover": {
                                bgcolor: "#ffebee",
                                transform: "scale(1.2)",
                                border: "1px solid #f44336",
                              },
                            }}
                          >
                            <Delete sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Card>
                  ))}

                  {/* Collection tasks from the general planning */}
                  {dayCollectionTasks.map((schedule, taskIndex) => (
                    <Card
                      key={`collection-task-${taskIndex}`}
                      sx={{
                        p: 1,
                        bgcolor: "#e8f5e8",
                        border: "1px solid #c8e6c9",
                        "&:hover": {
                          bgcolor: "#d4edda",
                          transform: "translateY(-1px)",
                          boxShadow: "0 2px 4px rgba(76, 175, 80, 0.2)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: "bold", color: "#4caf50" }}
                      >
                        📋 {schedule.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ color: "#666" }}
                      >
                        {new Date(schedule.start_time).toLocaleDateString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )}{" "}
                        -{" "}
                        {new Date(schedule.end_time).toLocaleDateString(
                          "fr-FR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )}
                      </Typography>
                    </Card>
                  ))}

                  {dayCollections.length === 0 &&
                    dayCollectionTasks.length === 0 && (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 2,
                          color: "text.secondary",
                          border: "2px dashed #e0e0e0",
                          borderRadius: 1,
                          bgcolor: "#fafafa",
                        }}
                      >
                        <Typography variant="body2">
                          Aucun lieu de collecte
                        </Typography>
                      </Box>
                    )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default WeekCollectionSection;
