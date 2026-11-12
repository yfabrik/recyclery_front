import type { Meta, StoryObj } from "@storybook/react-vite";
import { Euro, People, ShoppingCart } from "@mui/icons-material";
import { StatCard } from "./StatCard";

const meta = {
  title: "Components/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Unified metric card with optional avatar icon, subtitle, and trend indicator.",
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

export const WithIcon: Story = {
  args: {
    title: "Utilisateurs actifs",
    value: 24,
    color: "primary",
    icon: <People />,
    subtitle: "employés",
  },
};

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

export const WithTrendFlat: Story = {
  args: {
    title: "Objets vendus",
    value: "128",
    trend: "flat",
    trendValue: "0,0 %",
    trendLabel: "vs N-1",
  },
};

/** A rise shown red: lower is better for refunds. */
export const WithTrendTone: Story = {
  args: {
    title: "Remboursements",
    value: "84,00 €",
    subtitle: "3 remboursements · 1,2 % du brut",
    icon: undefined,
    trend: "up",
    trendValue: "+15,0 %",
    trendTone: "error",
    trendLabel: "vs période préc.",
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    trend: "up",
    trendValue: "+12 %",
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
