import type { Meta, StoryObj } from "@storybook/react-vite";
import { Euro, ShoppingCart } from "@mui/icons-material";
import { StatCard } from "./StatCard";

const meta = {
  title: "Dashboard/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Rich dashboard metric card with icon avatar, subtitle, and optional month-over-month trend.",
      },
    },
  },
  args: {
    title: "Chiffre d'affaires",
    value: "12 450 €",
    subtitle: "Ce mois",
    icon: <Euro />,
    color: "primary",
  },
} satisfies Meta<typeof StatCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrendUp: Story = {
  args: {
    title: "Ventes",
    value: "342",
    subtitle: "Transactions",
    icon: <ShoppingCart />,
    color: "success",
    trend: "up",
    trendValue: "+12 %",
  },
};

export const WithTrendDown: Story = {
  args: {
    title: "Panier moyen",
    value: "36,40 €",
    subtitle: "Ce mois",
    icon: <Euro />,
    color: "warning",
    trend: "down",
    trendValue: "-3 %",
  },
};

export const NoTrend: Story = {
  args: {
    title: "Articles en stock",
    value: "1 204",
    subtitle: "Disponibles",
    icon: <ShoppingCart />,
    color: "info",
  },
};
