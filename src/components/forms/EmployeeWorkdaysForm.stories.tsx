import type { Meta, StoryObj } from "@storybook/react-vite";
import { noopSubmit } from "../../stories/fixtures";
import { EmployeeWorkdaysForm } from "./EmployeeWorkdaysForm";

const meta = {
  title: "Forms/EmployeeWorkdaysForm",
  component: EmployeeWorkdaysForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Bi-weekly workday schedule editor (morning/afternoon slots per day). Requires formId and onSubmit.",
      },
    },
  },
  args: {
    formId: "employee-workdays-form",
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof EmployeeWorkdaysForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithWorkingMondayMorning: Story = {
  args: {
    defaults: [
      {
        id: 1,
        createdAt: new Date().toISOString(),
        day_of_week: "lundi",
        time_slot: "morning",
        is_working: true,
        start_time: new Date(new Date().setHours(8, 0)),
        end_time: new Date(new Date().setHours(12, 0)),
        notes: "",
        week: "week1",
      },
    ],
  },
};
