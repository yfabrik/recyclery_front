import type { Meta, StoryObj } from "@storybook/react-vite";

import { Calendar } from "./Calendar";

const meta = {
  component: Calendar,
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpeningTask:()=>true,
    getTaskDisplayName:()=>"tache",
    filteredSchedules: [
      {
        id: 1,
        name: "ff",
        description: "",
        category: "collection",
        priority: "medium",
        estimated_duration: 60,
        required_skills: "[]",
        location: "",
        equipment_needed: "[]",
        hourly_rate: "",
        is_recurring: false,
        recurrence_pattern: "none",
        assigned_to: "",
        notes: "",
        status: null,
        scheduled_date: "2026-01-12T11:10:48.678Z",
        createdAt: "2025-12-24T11:10:48.678Z",
        updatedAt: "2025-12-24T11:10:48.678Z",
      },
    ],
  },
};
