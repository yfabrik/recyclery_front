import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ScheduleModel } from "../../interfaces/Models";
import { Calendar } from "./Calendar";

const nowIso = new Date().toISOString();

const sampleSchedule: ScheduleModel = {
  id: 1,
  createdAt: nowIso,
  name: "Collecte matin",
  description: "",
  category: "collection",
  priority: "medium",
  required_skills: null,
  location: "Point Nord",
  equipment_needed: null,
  hourly_rate: null,
  is_recurring: false,
  recurrence_pattern: "none",
  notes: "",
  status: null,
  scheduled_date: "2026-01-12T11:10:48.678Z",
  start_time: "2026-01-12T08:00:00.000Z",
  end_time: "2026-01-12T12:00:00.000Z",
};

const meta = {
  title: "Planning/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Monthly calendar view for planning schedules and opening tasks.",
      },
    },
  },
  args: {
    isOpeningTask: () => false,
    getTaskDisplayName: (s: ScheduleModel) => s.name,
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    filteredSchedules: [sampleSchedule],
  },
};

export const MultipleSchedules: Story = {
  args: {
    filteredSchedules: [
      sampleSchedule,
      {
        ...sampleSchedule,
        id: 2,
        name: "Vente après-midi",
        category: "vente",
        start_time: "2026-01-14T14:00:00.000Z",
        end_time: "2026-01-14T18:00:00.000Z",
        scheduled_date: "2026-01-14T11:10:48.678Z",
      },
    ],
  },
};

export const EmptyWeek: Story = {
  args: {
    filteredSchedules: [],
  },
};
