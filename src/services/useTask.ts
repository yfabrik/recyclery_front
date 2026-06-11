import { useEffect, useState } from "react";
import type { TaskModel } from "../interfaces/Models";
import { createTask, getTasks, updateTask, deleteTask } from "./api/tasks";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";

export const useTask = () => {
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [editingTask, setEditingTask] = useState<TaskModel | null>();

  const fetchTasks = async () => {
    const response = await getTasks();
    setTasks(response.data.tasks);
  };

  const saveTask = async (data) => {
    if (!editingTask?.id) {
      const response = await createTask(data);
      toast.success(getApiSuccessMessage(response, "Planning créé avec succès"));
    } else {
      const response = await updateTask(editingTask.id, data);
      toast.success(
        getApiSuccessMessage(response, "Planning mis à jour avec succès"),
      );
    }
  };

  const handleDeleteTask = async (task: TaskModel) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.name}" ?`)) {
      try {
        const response = await deleteTask(task.id);
        toast.success(
          getApiSuccessMessage(response, "Planning supprimé avec succès"),
        );
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Erreur lors de la suppression"));
      }
    }
  };
  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    fetchTasks,
    saveTask,
    handleDeleteTask,
  };
};
