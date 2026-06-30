import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CollectionPointModel, ScheduleModel } from "../interfaces/Models";
import { mockCollectionPoints } from "../stories/fixtures";
import { CardCollectionPoint } from "./CardCollectionPoint";

const nowIso = new Date().toISOString();

const schedule: ScheduleModel = {
  id: 5,
  createdAt: nowIso,
  day_of_week: "Mardi",
  is_recurring: true,
  recurrence_pattern: "weekly",
  name: "Collecte hebdomadaire",
  description: null,
  category: "point",
  priority: null,
  required_skills: null,
  location: null,
  equipment_needed: null,
  hourly_rate: null,
  notes: "",
  status: null,
  scheduled_date: "2026-02-10T12:55:17.500Z",
  start_time: "2026-02-06T08:00:13.017Z",
  end_time: "2026-02-06T16:00:13.017Z",
  schedule_id: 5,
  collection_point_id: 1,
  store_id: null,
};

const basePoint: CollectionPointModel = {
  ...mockCollectionPoints[0],
  TaskSchedules: [schedule],
};

const noopHandlers = {
  handleOpenHoursDialog: () => {},
  handleDeleteHours: () => {},
  handleOpenDialog: () => {},
  handleDeletePoint: () => {},
};

const meta = {
  title: "Planning/CardCollectionPoint",
  component: CardCollectionPoint,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Collection point card with schedules, contact info, and edit/delete actions.",
      },
    },
  },
  args: {
    point: basePoint,
    ...noopHandlers,
  },
} satisfies Meta<typeof CardCollectionPoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSchedules: Story = {
  args: {
    point: {
      ...basePoint,
      TaskSchedules: [schedule, { ...schedule, id: 6, day_of_week: "Jeudi" }],
    },
  },
};

export const Inactive: Story = {
  args: {
    point: {
      ...basePoint,
      is_active: false,
      name: "Point collecte Sud (fermé)",
      TaskSchedules: [],
    },
  },
};
