import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Activity } from "../../services/api/dashboard";
import { ActivityItem } from "./ActivityItem";

const baseActivity: Activity = {
  id: "1",
  type: "sale",
  description: "Vente en caisse",
  amount: "45,00 €",
  time: "Il y a 5 min",
  icon: "ShoppingCart",
  color: "success",
  status: "Terminé",
  statusColor: "success",
};

const meta = {
  title: "Dashboard/ActivityItem",
  component: ActivityItem,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Single row in the dashboard recent-activity list.",
      },
    },
  },
} satisfies Meta<typeof ActivityItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Sale: Story = {
  args: { activity: baseActivity },
};

export const Donation: Story = {
  args: {
    activity: {
      ...baseActivity,
      id: "2",
      type: "donation",
      description: "Don reçu",
      amount: "",
      icon: "VolunteerActivism",
      color: "info",
      status: "En attente",
      statusColor: "warning",
    },
  },
};

export const Collection: Story = {
  args: {
    activity: {
      ...baseActivity,
      id: "3",
      type: "collection",
      description: "Collecte point Nord",
      amount: "120 kg",
      icon: "LocalShipping",
      color: "primary",
      status: "Planifié",
      statusColor: "info",
    },
  },
};

export const Inventory: Story = {
  args: {
    activity: {
      ...baseActivity,
      id: "4",
      type: "inventory",
      description: "Étiquetage articles",
      icon: "Inventory",
      color: "secondary",
      status: "En cours",
      statusColor: "primary",
    },
  },
};
