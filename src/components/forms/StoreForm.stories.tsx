import type { Meta, StoryObj } from "@storybook/react-vite";
import { noopSubmit } from "../../stories/fixtures";
import { StoreForm } from "./StoreForm";

const meta = {
  title: "Forms/StoreForm",
  component: StoreForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Store (recyclery) profile form with manager assignment.",
      },
    },
  },
  args: {
    formId: "store-form",
    onSubmit: noopSubmit,
    managers: [
      {
        id: 1,
        createdAt: new Date().toISOString(),
        username: "admin",
        email: "admin@recyclerie.fr",
        role: "admin",
        isActive: true,
        last_login: new Date().toISOString(),
      },
      {
        id: 2,
        createdAt: new Date().toISOString(),
        username: "manager",
        email: "manager@recyclerie.fr",
        role: "manager",
        isActive: true,
        last_login: new Date().toISOString(),
      },
    ],
  },
} satisfies Meta<typeof StoreForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
