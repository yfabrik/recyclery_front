import type { Meta, StoryObj } from "@storybook/react-vite";
import { People } from "@mui/icons-material";
import { Avatar } from "@mui/material";
import { StatCard, StatCardNoIcon } from "./StatCard";

const meta = {
  title: "Components/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Admin tab stat card (simpler than Dashboard/StatCard). Supports optional children slot for an icon. StatCardNoIcon is a centered compact variant.",
      },
    },
  },
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithIcon: Story = {
  args: {
    title: "Utilisateurs actifs",
    value: 24,
    color: "primary.main",
    children: (
      <Avatar sx={{ bgcolor: "primary.main" }}>
        <People />
      </Avatar>
    ),
  },
};

export const NoIconVariant: Story = {
  render: () => (
    <StatCardNoIcon title="Magasins" value={5} color="success.main" />
  ),
};
