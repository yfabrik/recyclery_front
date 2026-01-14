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
} from "@mui/material";
import React, { useEffect } from "react";

/**
 * Generic weekly task section (one row of 7 days) used by the week view.
 * Everything is driven by the filterDaySchedules function so the same
 * component can render sales, presence, or normal tasks.
 */
const WeekTaskSection = ({
  title,
  chipLabel,
  chipSx,
  cardColor,
  borderColor,
  // weekDays,
  // dayNames,
  // filteredSchedules,
  // filterDaySchedules,
  // getStatusInfo,
  // getTaskDisplayName,
  // formatTime,
  // getEmployeeColor,
  // getEmployeeInitials,
  // isOpeningTask,
  // isPresenceTask,
  // isManuallyCreatedTask,
  // handleAssignEmployeesToTask,
  // handleOpenDialog,
  // handleDeleteTask,
  // emptyText,
  // showAddButton = false,
  // onAddClick,
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
        {/* {weekDays.map((day, index) => {
          const daySchedules = Array.isArray(filteredSchedules)
            ? filteredSchedules.filter((schedule) => {
                const scheduleDate = new Date(schedule.scheduled_date);
                return (
                  scheduleDate.getDate() === day.getDate() &&
                  scheduleDate.getMonth() === day.getMonth() &&
                  scheduleDate.getFullYear() === day.getFullYear()
                );
              })
            : [];

          // const rowSchedules = filterDaySchedules(day, daySchedules);
          return (
            <TaskCard
              key={index}
              tasks={daySchedules}
              day={day}
              cardColor={cardColor}
              dayName={dayNames[index]}
              showAddButton={showAddButton}
              onAddClick={onAddClick}
              emptyText={emptyText}
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
            />
          );
          // return (
          //   <Card
          //     key={index}
          //     sx={{
          //       minHeight: 200,
          //       border: "1px solid #e0e0e0",
          //       bgcolor:
          //         day.toDateString() === new Date().toDateString()
          //           ? "#e3f2fd"
          //           : "white",
          //       "&:hover": {
          //         boxShadow: 2,
          //         transform: "translateY(-1px)",
          //       },
          //       transition: "all 0.2s",
          //     }}
          //   >
          //     <CardHeader
          //       title={
          //         <Box
          //           sx={{
          //             display: "flex",
          //             alignItems: "center",
          //             justifyContent: "space-between",
          //           }}
          //         >
          //           <Box>
          //             <Typography
          //               variant="h6"
          //               sx={{ fontWeight: "bold", color: cardColor }}
          //             >
          //               {dayNames[index]}
          //             </Typography>
          //             <Typography variant="body2" color="text.secondary">
          //               {day.getDate()}/{day.getMonth() + 1}
          //             </Typography>
          //           </Box>
          //           {showAddButton && (
          //             <IconButton
          //               size="small"
          //               onClick={() => onAddClick && onAddClick(day)}
          //               sx={{
          //                 bgcolor: cardColor,
          //                 color: "white",
          //                 "&:hover": { bgcolor: cardColor },
          //               }}
          //             >
          //               <Add fontSize="small" />
          //             </IconButton>
          //           )}
          //         </Box>
          //       }
          //     />
          //     <CardContent sx={{ p: 1 }}>
          //       <Stack spacing={1}>
          //         {rowSchedules.map((schedule, scheduleIndex) => {
          //           const statusInfo = getStatusInfo(schedule.status);

          //           return (
          //             <Card
          //               key={scheduleIndex}
          //               sx={{
          //                 p: 1.5,
          //                 bgcolor: isManuallyCreatedTask(schedule)
          //                   ? "#ffffff"
          //                   : isOpeningTask(schedule)
          //                   ? "#f1f8e9"
          //                   : isPresenceTask(schedule)
          //                   ? "#fff8e1"
          //                   : `${statusInfo.color}.100`,
          //                 border: isManuallyCreatedTask(schedule)
          //                   ? "2px solid #e0e0e0"
          //                   : isOpeningTask(schedule)
          //                   ? "1px solid #c8e6c9"
          //                   : isPresenceTask(schedule)
          //                   ? "1px solid #ffcc02"
          //                   : `1px solid ${statusInfo.color}.300`,
          //                 "&:hover": {
          //                   bgcolor: isManuallyCreatedTask(schedule)
          //                     ? "#f5f5f5"
          //                     : isOpeningTask(schedule)
          //                     ? "#e8f5e8"
          //                     : isPresenceTask(schedule)
          //                     ? "#fff3e0"
          //                     : `${statusInfo.color}.200`,
          //                   boxShadow: isOpeningTask(schedule)
          //                     ? "0 2px 8px rgba(76, 175, 80, 0.2)"
          //                     : isPresenceTask(schedule)
          //                     ? "0 2px 8px rgba(255, 152, 0, 0.2)"
          //                     : "none",
          //                 },
          //               }}
          //             >
          //               <Box sx={{ mb: 1 }}>
          //                 <Typography
          //                   variant="body2"
          //                   fontWeight="bold"
          //                   sx={{
          //                     color: isOpeningTask(schedule)
          //                       ? "#4caf50"
          //                       : isPresenceTask(schedule)
          //                       ? "#ff9800"
          //                       : "inherit",
          //                   }}
          //                 >
          //                   {getTaskDisplayName(schedule)}
          //                 </Typography>
          //                 <Typography
          //                   variant="caption"
          //                   display="block"
          //                   sx={{ fontWeight: "bold", color: "#2196f3" }}
          //                 >
          //                   🏪 {schedule.store_name || "Magasin non assigné"}
          //                 </Typography>
          //                 <Typography
          //                   variant="caption"
          //                   color="text.secondary"
          //                   display="block"
          //                 >
          //                   {formatTime(schedule.start_time)} -{" "}
          //                   {formatTime(schedule.end_time)}
          //                 </Typography>

          //                 {schedule.assigned_employees &&
          //                   schedule.assigned_employees.length > 0 && (
          //                     <Box
          //                       sx={{
          //                         display: "flex",
          //                         flexDirection: "column",
          //                         gap: 0.3,
          //                         mb: 0.5,
          //                         p: 0.5,
          //                         bgcolor: isPresenceTask(schedule)
          //                           ? "#fff3e0"
          //                           : "#e8f5e8",
          //                         borderRadius: 1,
          //                         border: isPresenceTask(schedule)
          //                           ? "1px solid #ffcc02"
          //                           : "1px solid #4caf50",
          //                       }}
          //                     >
          //                       <Typography
          //                         variant="caption"
          //                         sx={{
          //                           color: isPresenceTask(schedule)
          //                             ? "#e65100"
          //                             : "#2e7d32",
          //                           fontSize: "0.7rem",
          //                           fontWeight: "bold",
          //                           textAlign: "center",
          //                         }}
          //                       >
          //                         👥 Employés (
          //                         {schedule.assigned_employees.length})
          //                       </Typography>
          //                       <Box
          //                         sx={{
          //                           display: "flex",
          //                           flexDirection: "column",
          //                           gap: 0.3,
          //                           alignItems: "center",
          //                         }}
          //                       >
          //                         {schedule.assigned_employees.map(
          //                           (emp, idx) => (
          //                             <Box
          //                               key={idx}
          //                               sx={{
          //                                 display: "flex",
          //                                 alignItems: "center",
          //                                 gap: 0.3,
          //                                 p: 0.3,
          //                                 bgcolor: "white",
          //                                 borderRadius: 0.5,
          //                                 border: isPresenceTask(schedule)
          //                                   ? "1px solid #ffcc02"
          //                                   : "1px solid #c8e6c9",
          //                                 width: "100%",
          //                                 justifyContent: "center",
          //                               }}
          //                             >
          //                               <Avatar
          //                                 sx={{
          //                                   width: 16,
          //                                   height: 16,
          //                                   fontSize: isPresenceTask(schedule)
          //                                     ? "0.7rem"
          //                                     : "0.6rem",
          //                                   bgcolor: getEmployeeColor(
          //                                     emp.username
          //                                   ),
          //                                   color: "white",
          //                                   fontWeight: "bold",
          //                                 }}
          //                                 title={emp.username}
          //                               >
          //                                 {emp.initials ||
          //                                   getEmployeeInitials(emp.username)}
          //                               </Avatar>
          //                               <Typography
          //                                 variant="caption"
          //                                 sx={{
          //                                   color: isPresenceTask(schedule)
          //                                     ? "#e65100"
          //                                     : "#2e7d32",
          //                                   fontSize: isPresenceTask(schedule)
          //                                     ? "0.7rem"
          //                                     : "0.65rem",
          //                                   fontWeight: isPresenceTask(schedule)
          //                                     ? "medium"
          //                                     : "bold",
          //                                   whiteSpace: "nowrap",
          //                                 }}
          //                               >
          //                                 {emp.username}
          //                               </Typography>
          //                             </Box>
          //                           )
          //                         )}
          //                       </Box>
          //                     </Box>
          //                   )}
          //                 {schedule.location_name && (
          //                   <Typography
          //                     variant="caption"
          //                     display="block"
          //                     sx={{ fontWeight: "bold", color: "#9c27b0" }}
          //                   >
          //                     📍 {schedule.location_name}
          //                   </Typography>
          //                 )}
          //               </Box>
          //               <Box
          //                 sx={{
          //                   display: "flex",
          //                   justifyContent: "flex-end",
          //                   gap: 0.5,
          //                 }}
          //               >
          //                 <Button
          //                   size="small"
          //                   variant="contained"
          //                   onClick={(e) => {
          //                     e.stopPropagation();
          //                     handleAssignEmployeesToTask(schedule);
          //                   }}
          //                   sx={{
          //                     bgcolor: "#4caf50",
          //                     color: "white",
          //                     fontSize: "0.6rem",
          //                     height: 24,
          //                     minWidth: 60,
          //                     "&:hover": {
          //                       bgcolor: "#45a049",
          //                       transform: "scale(1.05)",
          //                     },
          //                   }}
          //                 >
          //                   +
          //                 </Button>

          //                 <IconButton
          //                   size="small"
          //                   onClick={(e) => {
          //                     e.stopPropagation();
          //                     handleOpenDialog(schedule);
          //                   }}
          //                   sx={{
          //                     color: "#2196f3",
          //                     minWidth: 24,
          //                     minHeight: 24,
          //                     width: 24,
          //                     height: 24,
          //                     bgcolor: "rgba(33, 150, 243, 0.1)",
          //                     border: "1px solid rgba(33, 150, 243, 0.3)",
          //                     "&:hover": {
          //                       bgcolor: "#e3f2fd",
          //                       transform: "scale(1.2)",
          //                       border: "1px solid #2196f3",
          //                     },
          //                   }}
          //                 >
          //                   <Edit sx={{ fontSize: 14 }} />
          //                 </IconButton>
          //                 <IconButton
          //                   size="small"
          //                   onClick={(e) => {
          //                     e.stopPropagation();
          //                     handleDeleteTask(schedule);
          //                   }}
          //                   sx={{
          //                     color: "#f44336",
          //                     minWidth: 24,
          //                     minHeight: 24,
          //                     width: 24,
          //                     height: 24,
          //                     bgcolor: "rgba(244, 67, 54, 0.1)",
          //                     border: "1px solid rgba(244, 67, 54, 0.3)",
          //                     "&:hover": {
          //                       bgcolor: "#ffebee",
          //                       transform: "scale(1.2)",
          //                       border: "1px solid #f44336",
          //                     },
          //                   }}
          //                 >
          //                   <Delete sx={{ fontSize: 14 }} />
          //                 </IconButton>
          //               </Box>
          //             </Card>
          //           );
          //         })}

          //         {rowSchedules.length === 0 && (
          //           <Box
          //             sx={{
          //               textAlign: "center",
          //               py: 3,
          //               color: "text.secondary",
          //               border: "2px dashed #e0e0e0",
          //               borderRadius: 1,
          //               bgcolor: "#fafafa",
          //             }}
          //           >
          //             <Typography variant="body2">{emptyText}</Typography>
          //           </Box>
          //         )}
          //       </Stack>
          //     </CardContent>
          //   </Card>
          // );
        })} */}
      </Box>
    </Box>
  );
};

export default WeekTaskSection;

export const TaskCard = ({
  // tasks = [],
  day,
  cardColor,
  dayName,
  showAddButton,
  onAddClick,
  emptyText,
  // getEmployeeColor,
  // getEmployeeInitials,
  // handleAssignEmployeesToTask,
  // handleOpenDialog,
  // handleDeleteTask,
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
          {children}

          {/* {tasks && Array.isArray(tasks) && tasks?.map((schedule, scheduleIndex) => {
            return (
              <TaskCardContent
              key={scheduleIndex}
              schedule={schedule}
              getEmployeeColor={getEmployeeColor}
              getEmployeeInitials={getEmployeeInitials}
              handleAssignEmployeesToTask={handleAssignEmployeesToTask}
              handleOpenDialog={handleOpenDialog}
              handleDeleteTask={handleDeleteTask}
              />
              ); 
            })}
               */}
          {/* 
            // const statusInfo = getStatusInfo(schedule.status);

            // return (
            //   <Card
            //     key={scheduleIndex}
            //     sx={{
            //       p: 1.5,
            //       bgcolor: isManuallyCreatedTask(schedule)
            //         ? "#ffffff"
            //         : isOpeningTask(schedule)
            //         ? "#f1f8e9"
            //         : isPresenceTask(schedule)
            //         ? "#fff8e1"
            //         : `${statusInfo.color}.100`,
            //       border: isManuallyCreatedTask(schedule)
            //         ? "2px solid #e0e0e0"
            //         : isOpeningTask(schedule)
            //         ? "1px solid #c8e6c9"
            //         : isPresenceTask(schedule)
            //         ? "1px solid #ffcc02"
            //         : `1px solid ${statusInfo.color}.300`,
            //       "&:hover": {
            //         bgcolor: isManuallyCreatedTask(schedule)
            //           ? "#f5f5f5"
            //           : isOpeningTask(schedule)
            //           ? "#e8f5e8"
            //           : isPresenceTask(schedule)
            //           ? "#fff3e0"
            //           : `${statusInfo.color}.200`,
            //         boxShadow: isOpeningTask(schedule)
            //           ? "0 2px 8px rgba(76, 175, 80, 0.2)"
            //           : isPresenceTask(schedule)
            //           ? "0 2px 8px rgba(255, 152, 0, 0.2)"
            //           : "none",
            //       },
            //     }}
            //   >
            //     <Box sx={{ mb: 1 }}>
            //       <Typography
            //         variant="body2"
            //         fontWeight="bold"
            //         sx={{
            //           color: isOpeningTask(schedule)
            //             ? "#4caf50"
            //             : isPresenceTask(schedule)
            //             ? "#ff9800"
            //             : "inherit",
            //         }}
            //       >
            //         {getTaskDisplayName(schedule)}
            //       </Typography>
            //       <Typography
            //         variant="caption"
            //         display="block"
            //         sx={{ fontWeight: "bold", color: "#2196f3" }}
            //       >
            //         🏪 {schedule.store_name || "Magasin non assigné"}
            //       </Typography>
            //       <Typography
            //         variant="caption"
            //         color="text.secondary"
            //         display="block"
            //       >
            //         {formatTime(schedule.start_time)} -{" "}
            //         {formatTime(schedule.end_time)}
            //       </Typography>

            //       {schedule.assigned_employees &&
            //         schedule.assigned_employees.length > 0 && (
            //           <Box
            //             sx={{
            //               display: "flex",
            //               flexDirection: "column",
            //               gap: 0.3,
            //               mb: 0.5,
            //               p: 0.5,
            //               bgcolor: isPresenceTask(schedule)
            //                 ? "#fff3e0"
            //                 : "#e8f5e8",
            //               borderRadius: 1,
            //               border: isPresenceTask(schedule)
            //                 ? "1px solid #ffcc02"
            //                 : "1px solid #4caf50",
            //             }}
            //           >
            //             <Typography
            //               variant="caption"
            //               sx={{
            //                 color: isPresenceTask(schedule)
            //                   ? "#e65100"
            //                   : "#2e7d32",
            //                 fontSize: "0.7rem",
            //                 fontWeight: "bold",
            //                 textAlign: "center",
            //               }}
            //             >
            //               👥 Employés ({schedule.assigned_employees.length})
            //             </Typography>
            //             <Box
            //               sx={{
            //                 display: "flex",
            //                 flexDirection: "column",
            //                 gap: 0.3,
            //                 alignItems: "center",
            //               }}
            //             >
            //               {schedule.assigned_employees.map((emp, idx) => (
            //                 <Box
            //                   key={idx}
            //                   sx={{
            //                     display: "flex",
            //                     alignItems: "center",
            //                     gap: 0.3,
            //                     p: 0.3,
            //                     bgcolor: "white",
            //                     borderRadius: 0.5,
            //                     border: isPresenceTask(schedule)
            //                       ? "1px solid #ffcc02"
            //                       : "1px solid #c8e6c9",
            //                     width: "100%",
            //                     justifyContent: "center",
            //                   }}
            //                 >
            //                   <Avatar
            //                     sx={{
            //                       width: 16,
            //                       height: 16,
            //                       fontSize: isPresenceTask(schedule)
            //                         ? "0.7rem"
            //                         : "0.6rem",
            //                       bgcolor: getEmployeeColor(emp.username),
            //                       color: "white",
            //                       fontWeight: "bold",
            //                     }}
            //                     title={emp.username}
            //                   >
            //                     {emp.initials ||
            //                       getEmployeeInitials(emp.username)}
            //                   </Avatar>
            //                   <Typography
            //                     variant="caption"
            //                     sx={{
            //                       color: isPresenceTask(schedule)
            //                         ? "#e65100"
            //                         : "#2e7d32",
            //                       fontSize: isPresenceTask(schedule)
            //                         ? "0.7rem"
            //                         : "0.65rem",
            //                       fontWeight: isPresenceTask(schedule)
            //                         ? "medium"
            //                         : "bold",
            //                       whiteSpace: "nowrap",
            //                     }}
            //                   >
            //                     {emp.username}
            //                   </Typography>
            //                 </Box>
            //               ))}
            //             </Box>
            //           </Box>
            //         )}
            //       {schedule.location_name && (
            //         <Typography
            //           variant="caption"
            //           display="block"
            //           sx={{ fontWeight: "bold", color: "#9c27b0" }}
            //         >
            //           📍 {schedule.location_name}
            //         </Typography>
            //       )}
            //     </Box>
            //     <Box
            //       sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}
            //     >
            //       <Button
            //         size="small"
            //         variant="contained"
            //         onClick={(e) => {
            //           e.stopPropagation();
            //           handleAssignEmployeesToTask(schedule);
            //         }}
            //         sx={{
            //           bgcolor: "#4caf50",
            //           color: "white",
            //           fontSize: "0.6rem",
            //           height: 24,
            //           minWidth: 60,
            //           "&:hover": {
            //             bgcolor: "#45a049",
            //             transform: "scale(1.05)",
            //           },
            //         }}
            //       >
            //         +
            //       </Button>

            //       <IconButton
            //         size="small"
            //         onClick={(e) => {
            //           e.stopPropagation();
            //           handleOpenDialog(schedule);
            //         }}
            //         sx={{
            //           color: "#2196f3",
            //           minWidth: 24,
            //           minHeight: 24,
            //           width: 24,
            //           height: 24,
            //           bgcolor: "rgba(33, 150, 243, 0.1)",
            //           border: "1px solid rgba(33, 150, 243, 0.3)",
            //           "&:hover": {
            //             bgcolor: "#e3f2fd",
            //             transform: "scale(1.2)",
            //             border: "1px solid #2196f3",
            //           },
            //         }}
            //       >
            //         <Edit sx={{ fontSize: 14 }} />
            //       </IconButton>
            //       <IconButton
            //         size="small"
            //         onClick={(e) => {
            //           e.stopPropagation();
            //           handleDeleteTask(schedule);
            //         }}
            //         sx={{
            //           color: "#f44336",
            //           minWidth: 24,
            //           minHeight: 24,
            //           width: 24,
            //           height: 24,
            //           bgcolor: "rgba(244, 67, 54, 0.1)",
            //           border: "1px solid rgba(244, 67, 54, 0.3)",
            //           "&:hover": {
            //             bgcolor: "#ffebee",
            //             transform: "scale(1.2)",
            //             border: "1px solid #f44336",
            //           },
            //         }}
            //       >
            //         <Delete sx={{ fontSize: 14 }} />
            //       </IconButton>
            //     </Box>
            //   </Card>
            // );
          // })}

          // {tasks.length === 0 && (
          //   <Box
          //     sx={{
          //       textAlign: "center",
          //       py: 3,
          //       color: "text.secondary",
          //       border: "2px dashed #e0e0e0",
          //       borderRadius: 1,
          //       bgcolor: "#fafafa",
          //     }}
          //   >
          //     <Typography variant="body2">{emptyText}</Typography>
          //   </Box>
          // )} */}
        </Stack>
      </CardContent>
    </Card>
  );
};

export const TaskCardContent = ({
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

  const cardstyle = new Map();
  cardstyle.set("vente", getOpeningCardStyle);
  cardstyle.set("point", getPresenceCardStyle);

  const taskstyle = new Map();
  taskstyle.set("vente", getOpeningTaskStyle);
  taskstyle.set("point", getPresenceTaskStyle);

  const css = cardstyle.get(schedule.category)();

  const cssPresenceTask = {
    color: "#e65100",
    fontSize: "0.7rem",
    fontWeight: "medium",
    border: "#ff9800", //"1px solid #ffcc02"
    bgColor: "#fff3e0",
  };
  const cssVenteTask = {
    color: "#2e7d32",
    fontSize: "0.65rem",
    fontWeight: "bold",
    border: "#4caf50", //"1px solid #4caf50","1px solid #c8e6c9",
    bgColor: "#e8f5e8",
  };

  return (
    <Card
      sx={{
        p: 1.5,
        ...css,
        // bgcolor: isManuallyCreatedTask(schedule)
        //   ? "#ffffff"
        //   : isOpeningTask(schedule)
        //   ? "#f1f8e9"
        //   : isPresenceTask(schedule)
        //   ? "#fff8e1"
        //   : `${statusInfo.color}.100`,
        // border: isManuallyCreatedTask(schedule)
        //   ? "2px solid #e0e0e0"
        //   : isOpeningTask(schedule)
        //   ? "1px solid #c8e6c9"
        //   : isPresenceTask(schedule)
        //   ? "1px solid #ffcc02"
        //   : `1px solid ${statusInfo.color}.300`,
        // "&:hover": {
        //   bgcolor: isManuallyCreatedTask(schedule)
        //     ? "#f5f5f5"
        //     : isOpeningTask(schedule)
        //     ? "#e8f5e8"
        //     : isPresenceTask(schedule)
        //     ? "#fff3e0"
        //     : `${statusInfo.color}.200`,
        //   boxShadow: isOpeningTask(schedule)
        //     ? "0 2px 8px rgba(76, 175, 80, 0.2)"
        //     : isPresenceTask(schedule)
        //     ? "0 2px 8px rgba(255, 152, 0, 0.2)"
        //     : "none",
        // },
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="body2"
          fontWeight="bold"
          sx={{
            color: "#4caf50",
            //  isOpeningTask(schedule)
            //   ? "#4caf50"
            //   : isPresenceTask(schedule)
            //   ? "#ff9800"
            // : "inherit",
            // "inherit",
          }}
        >
          {/* {getTaskDisplayName(schedule)} */}
        </Typography>
        <Typography
          variant="caption"
          display="block"
          sx={{ fontWeight: "bold", color: "#2196f3" }}
        >
          🏪 {schedule.store_name || "Magasin non assigné"}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          {periode}
          {/* {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)} */}
        </Typography>

        {schedule.assigned_employees &&
          schedule.assigned_employees.length > 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.3,
                mb: 0.5,
                p: 0.5,
                // bgcolor: isPresenceTask(schedule) ? "#fff3e0" : "#e8f5e8",
                backgroundColor: "#fff3e0",
                borderRadius: 1,
                border: "1px solid #ffcc02",
                // border: isPresenceTask(schedule)
                //   ? "1px solid #ffcc02"
                //   : "1px solid #4caf50",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "#e65100",
                  // color: isPresenceTask(schedule) ? "#e65100" : "#2e7d32",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                👥 Employés ({schedule.assigned_employees.length})
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.3,
                  alignItems: "center",
                }}
              >
                {schedule.assigned_employees.map((emp, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.3,
                      p: 0.3,
                      bgcolor: "white",
                      borderRadius: 0.5,
                      border: "1px solid #ffcc02",
                      // border: isPresenceTask(schedule)
                      //   ? "1px solid #ffcc02"
                      //   : "1px solid #c8e6c9",
                      width: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 16,
                        height: 16,
                        fontSize: ".7rem",
                        // fontSize: isPresenceTask(schedule)
                        //   ? "0.7rem"
                        //   : "0.6rem",
                        bgcolor: getEmployeeColor(emp.username),
                        color: "white",
                        fontWeight: "bold",
                      }}
                      title={emp.username}
                    >
                      {emp.initials || getEmployeeInitials(emp.username)}
                    </Avatar>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#e65100",
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        // color: isPresenceTask(schedule) ? "#e65100" : "#2e7d32",
                        // fontSize: isPresenceTask(schedule)
                        //   ? "0.7rem"
                        //   : "0.65rem",
                        // fontWeight: isPresenceTask(schedule)
                        //   ? "medium"
                        //   : "bold",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.username}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        {/* {schedule.location_name && (
          <Typography
            variant="caption"
            display="block"
            sx={{ fontWeight: "bold", color: "#9c27b0" }}
          >
            📍 {schedule.location_name}
          </Typography>
        )} */}
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

export const TaskCardControls = ({
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
