import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import {
  EmployeeTasksTimeline,
  type EmployeeTaskItem,
} from "./EmployeeTasksTimeline";

const sampleTasks: EmployeeTaskItem[] = [
  {
    name: "Ouverture magasin",
    start_time: "2025-02-17T09:00:00",
    end_time: "2025-02-17T12:00:00",
    day_of_week: "Lundi",
    category: "vente",
  },
  {
    name: "Présence point de collecte",
    start_time: "2025-02-17T14:00:00",
    end_time: "2025-02-17T18:00:00",
    day_of_week: "Lundi",
    category: "point",
  },
  {
    name: "Vente",
    start_time: "2025-02-18T10:00:00",
    end_time: "2025-02-18T13:00:00",
    day_of_week: "Mardi",
    category: "vente",
  },
  {
    name: "Tri des dons",
    start_time: "2025-02-19T08:30:00",
    end_time: "2025-02-19T12:30:00",
    day_of_week: "Mercredi",
    category: "sorting",
  },
  {
    name: "Collecte",
    start_time: "2025-02-20T07:00:00",
    end_time: "2025-02-20T11:00:00",
    day_of_week: "Jeudi",
    category: "collection",
  },
];

const meta = {
  component: EmployeeTasksTimeline,
  title: "Planning/EmployeeTasksTimeline",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Timeline that displays employee tasks with start/end time, day of week and task name. Accepts an array of tasks compatible with TaskModel.",
      },
    },
  },
  argTypes: {
    tasks: {
      description: "List of employee tasks to display.",
      control: false,
    },
    employeeName: {
      description: "Employee name shown at the top (e.g. for printing).",
      control: "text",
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 420, width: "100%" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EmployeeTasksTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default timeline with a week of sample tasks. */
export const Default: Story = {
  args: {
    tasks: sampleTasks,
  },
};

/** With employee name on top (e.g. for printing). */
export const WithEmployeeName: Story = {
  args: {
    tasks: sampleTasks,
    employeeName: "Marie Dupont",
  },
};

/** Single task. */
export const SingleTask: Story = {
  args: {
    tasks: [sampleTasks[0]],
  },
};

/** Two tasks on the same day. */
export const SameDay: Story = {
  args: {
    tasks: sampleTasks.slice(0, 2),
  },
};

/** Empty list shows a placeholder message. */
export const Empty: Story = {
  args: {
    tasks: [],
  },
};
