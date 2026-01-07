import { useEffect, useState } from "react";
import type { TaskModel } from "../interfaces/Models";
import { createTask, getTasks, updateTask, deleteTask } from "./api/tasks";
import { toast } from "react-toastify";

export const useTask = () => {
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [editingTask, setEditingTask] = useState<TaskModel | null>();

  const fetchTasks = async () => {
    const response = await getTasks();
    setTasks(response.data.tasks);
  };

  const saveTask = async (data) => {
    if (!editingTask?.id) {
      await createTask(data);
      toast.success("Planning créé avec succès");
    } else {
      await updateTask(editingTask.id, data);
      toast.success("Planning mis à jour avec succès");
    }
  };

  const handleDeleteTask = async (task: TaskModel) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.name}" ?`)) {
      try {
        await deleteTask(task.id);
        toast.success("Planning supprimé avec succès");
      } catch {
        toast.error("Erreur lors de la suppression");
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
