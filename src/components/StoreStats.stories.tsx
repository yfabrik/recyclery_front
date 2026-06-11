import type { Meta, StoryObj } from "@storybook/react-vite";
import type { StoreStat } from "../services/api/dashboard";
import StoreStats from "./StoreStats";

const mockStoreStats: StoreStat[] = [
  {
    id: 1,
    name: "Recyclerie Centre",
    address: "12 rue de la Recyclerie",
    phone: "03 20 00 00 00",
    email: "centre@recyclerie.fr",
    stats: {
      currentMonth: {
        transactions: 342,
        revenue: 12450,
        averageTransaction: 36.4,
        sessions: 28,
      },
      lastMonth: { transaction: 298, revenue: 10800 },
      items: { available: 1204, sold: 89 },
      growth: { revenue: 15.3 },
    },
  },
  {
    id: 2,
    name: "Recyclerie Nord",
    address: "45 avenue du Nord",
    phone: null,
    email: null,
    stats: {
      currentMonth: {
        transactions: 198,
        revenue: 7200,
        averageTransaction: 36.4,
        sessions: 22,
      },
      lastMonth: { transaction: 210, revenue: 7600 },
      items: { available: 890, sold: 54 },
      growth: { revenue: -5.3 },
    },
  },
];

const meta = {
  title: "Dashboard/StoreStats",
  component: StoreStats,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Per-store monthly stats cards with growth indicators and history dialog.",
      },
    },
  },
} satisfies Meta<typeof StoreStats>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stores: mockStoreStats,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    stores: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    stores: [],
    loading: false,
  },
};
