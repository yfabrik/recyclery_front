import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockStores, noopSubmit } from "../../stories/fixtures";
import { UserForm } from "./UserForm";

const meta = {
  title: "Forms/UserForm",
  component: UserForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "User account form with role, store assignment, and managed stores for managers.",
      },
    },
  },
  args: {
    formId: "user-form",
    defaultValues: {},
    onSubmit: noopSubmit,
    stores: mockStores,
    roles: [
      { name: "employee", display_name: "Employé" },
      { name: "manager", display_name: "Manager" },
      { name: "admin", display_name: "Administrateur" },
    ],
  },
} satisfies Meta<typeof UserForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
