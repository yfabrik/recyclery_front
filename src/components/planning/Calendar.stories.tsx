import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar } from "./Calendar";

/** Matches the local `Task` shape expected by `Calendar`. */
type CalendarTask = {
  scheduled_date: Date;
  task_employees: { username: string }[];
  assigned_employees: { username: string }[];
};

const sampleSchedule: CalendarTask = {
  scheduled_date: new Date("2026-01-12T11:10:48.678Z"),
  task_employees: [{ username: "marie" }],
  assigned_employees: [{ username: "jean" }],
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
    filteredSchedules: [sampleSchedule],
    handleOpenDialog: () => {},
    isOpeningTask: () => false,
    isPresenceTask: () => false,
    getTaskDisplayName: () => "Collecte matin",
    handleDeleteTask: () => {},
  },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleSchedules: Story = {
  args: {
    filteredSchedules: [
      sampleSchedule,
      {
        ...sampleSchedule,
        scheduled_date: new Date("2026-01-14T11:10:48.678Z"),
        task_employees: [],
        assigned_employees: [{ username: "sophie" }],
      },
    ],
  },
};

export const EmptyWeek: Story = {
  args: {
    filteredSchedules: [] as CalendarTask[],
  },
};
