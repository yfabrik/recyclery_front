import type { Meta, StoryObj } from "@storybook/react-vite";
import { noopSubmit } from "../../stories/fixtures";
import { TaskForm } from "./TaskForm";

const nowIso = new Date().toISOString();

const meta = {
  title: "Forms/TaskForm",
  component: TaskForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Task scheduling form with category, employees, and time slots.",
      },
    },
  },
  args: {
    formId: "task-form",
    employees: [
      { id: 1, createdAt: nowIso, fullName: "Marie Dupont", nom: "Dupont", prenom: "Marie", isActive: true },
      { id: 2, createdAt: nowIso, fullName: "Jean Martin", nom: "Martin", prenom: "Jean", isActive: true },
    ],
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof TaskForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubmitButton: Story = {
  render: (args) => (
    <>
      <TaskForm {...args} />
      <button type="submit" form={args.formId}>
        Submit
      </button>
    </>
  ),
};
