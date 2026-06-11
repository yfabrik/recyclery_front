import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TaskModel } from "../../interfaces/Models";
import WeekViewSections from "./WeekViewSections";

const nowIso = new Date().toISOString();

const sampleSchedules: TaskModel[] = [
  {
    id: 60,
    createdAt: nowIso,
    name: "Vente matin",
    description: null,
    category: "vente",
    priority: null,
    required_skills: null,
    location: null,
    equipment_needed: null,
    hourly_rate: null,
    scheduled_date: "2026-02-10T08:42:28.630Z",
    start_time: "2026-01-12T09:00:00.000Z",
    end_time: "2026-01-12T12:00:00.000Z",
    notes: null,
    status: null,
    day_of_week: "lundi",
  },
  {
    id: 61,
    createdAt: nowIso,
    name: "Collecte après-midi",
    description: null,
    category: "collection",
    priority: null,
    required_skills: null,
    location: "Point Nord",
    equipment_needed: null,
    hourly_rate: null,
    scheduled_date: "2026-02-11T08:42:28.630Z",
    start_time: "2026-01-13T14:00:00.000Z",
    end_time: "2026-01-13T17:00:00.000Z",
    notes: null,
    status: null,
    day_of_week: "mardi",
  },
];

const handlers = {
  getEmployeeColor: () => "#1976d2",
  getEmployeeInitials: (name: string) => name.slice(0, 2).toUpperCase(),
  handleAssignEmployeesToTask: () => {},
  handleOpenDialog: () => {},
  handleDeleteTask: () => {},
};

const meta = {
  title: "Planning/WeekViewSections",
  component: WeekViewSections,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Week planning sections grouped by task category and time slot (vente, point, collection).",
      },
    },
  },
  args: {
    selectedDate: new Date("2026-02-10"),
    schedules: sampleSchedules,
    ...handlers,
  },
} satisfies Meta<typeof WeekViewSections>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyWeek: Story = {
  args: {
    schedules: [],
  },
};
