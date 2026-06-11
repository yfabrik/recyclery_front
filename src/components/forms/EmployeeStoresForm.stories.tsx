import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockStores, noopSubmit } from "../../stories/fixtures";
import { EmployeeStoresForm } from "./EmployeeStoresForm";

const meta = {
  title: "Forms/EmployeeStoresForm",
  component: EmployeeStoresForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Assigns an employee to one or more stores with a primary store selection.",
      },
    },
  },
  args: {
    formId: "employee-stores-form",
    stores: mockStores,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof EmployeeStoresForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
