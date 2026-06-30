import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockStores, noopSubmit } from "../../stories/fixtures";
import { EmployeeForm } from "./EmployeeForm";

const meta = {
  title: "Forms/EmployeeForm",
  component: EmployeeForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Employee profile form (name, phone, store assignment, active flag). Submit via external button using formId.",
      },
    },
  },
  args: {
    formId: "employee-form",
    stores: mockStores,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof EmployeeForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
