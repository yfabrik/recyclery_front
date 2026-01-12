import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { TaskForm } from "../components/forms/TaskForm";
import { createTask, getTasks } from "../services/api/tasks";
import { useEffect, useState } from "react";
import type { TaskModel } from "../interfaces/Models";
import { getPlanning } from "../services/api/planning";

export const TestPage = () => {
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [schedules, setSchedules] = useState([]);

  const fetchTasks = async () => {
    const response = await getTasks();
    setTasks(response.data.tasks);
  };
  const handleSave = async (data) => {
    console.log(data);
    const task = await createTask(data);
    console.log(task);
    fetchTasks();
    fetchSchedules();
  };

  const fetchSchedules = async () => {
    const response = await getPlanning();
    setSchedules(response.data.schedules);
  };

  useEffect(() => {
    fetchTasks();
    fetchSchedules();
  }, []);
  return (
    <>
      <TaskForm onSubmit={handleSave} formId="test" employees={[]} />
      <Button type="submit" form="test" variant="contained">
        {" "}
        submit
      </Button>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell align="right">name</TableCell>
              <TableCell align="right">category</TableCell>

              <TableCell align="right">schedule date</TableCell>
              <TableCell align="right">start</TableCell>
              <TableCell align="right">stop</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tasks.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="right">{row.name}</TableCell>
                <TableCell align="right">{row.category}</TableCell>
                <TableCell align="right">{row.scheduled_date}</TableCell>
                <TableCell align="right">{row.start_time}</TableCell>
                <TableCell align="right">{row.end_time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>id</TableCell>
              <TableCell align="right">category</TableCell>
              <TableCell align="right">pattern</TableCell>

              <TableCell align="right">schedule date</TableCell>
              <TableCell align="right">start</TableCell>
              <TableCell align="right">stop</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="right">{row.category}</TableCell>
                <TableCell align="right">{row.recurrence_pattern}</TableCell>
                <TableCell align="right">{row.scheduled_date}</TableCell>
                <TableCell align="right">{row.start_time}</TableCell>
                <TableCell align="right">{row.end_time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
