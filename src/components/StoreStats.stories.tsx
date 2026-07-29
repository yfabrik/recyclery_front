import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { StoreHistory, StoreStat } from "../services/api/dashboard";
import axiosInstance from "../services/api/axios";
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
        start: "2026-06-01",
        end: "2026-06-30",
      },
      lastMonth: {
        transactions: 298,
        revenue: 10800,
        averageTransaction: 36.2,
        sessions: 25,
        start: "2026-05-01",
        end: "2026-05-31",
      },
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
        start: "2026-06-01",
        end: "2026-06-30",
      },
      lastMonth: {
        transactions: 210,
        revenue: 7600,
        averageTransaction: 36.2,
        sessions: 24,
        start: "2026-05-01",
        end: "2026-05-31",
      },
      items: { available: 890, sold: 54 },
      growth: { revenue: -5.3 },
    },
  },
];

const mockStoreHistory: StoreHistory = {
  id: 1,
  name: "Recyclerie Centre",
  address: "12 rue de la Recyclerie",
  phone: "03 20 00 00 00",
  email: "centre@recyclerie.fr",
  stats: [
    {
      currentMonth: {
        transactions: 342,
        revenue: 12450,
        averageTransaction: 36.4,
        sessions: 28,
        start: "2026-06-01",
        end: "2026-06-30",
      },
      lastMonth: {
        transactions: 298,
        revenue: 10800,
        averageTransaction: 36.2,
        sessions: 25,
        start: "2026-05-01",
        end: "2026-05-31",
      },
      items: { available: 1204, sold: 89 },
      growth: { revenue: 15.3 },
    },
    {
      currentMonth: {
        transactions: 298,
        revenue: 10800,
        averageTransaction: 36.2,
        sessions: 25,
        start: "2026-05-01",
        end: "2026-05-31",
      },
      lastMonth: {
        transactions: 275,
        revenue: 9900,
        averageTransaction: 36.0,
        sessions: 24,
        start: "2026-04-01",
        end: "2026-04-30",
      },
      items: { available: 1150, sold: 76 },
      growth: { revenue: 9.1 },
    },
    {
      currentMonth: {
        transactions: 275,
        revenue: 9900,
        averageTransaction: 36.0,
        sessions: 24,
        start: "2026-04-01",
        end: "2026-04-30",
      },
      lastMonth: {
        transactions: 260,
        revenue: 9200,
        averageTransaction: 35.4,
        sessions: 22,
        start: "2026-03-01",
        end: "2026-03-31",
      },
      items: { available: 1080, sold: 71 },
      growth: { revenue: 7.6 },
    },
  ],
};

function StoryWrapper({ stores = mockStoreStats }: { stores?: StoreStat[] }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

  useEffect(() => {
    const originalGet = axiosInstance.get.bind(axiosInstance);
    axiosInstance.get = ((url: string, config?: unknown) => {
      if (url.startsWith("/api/dashboard/store-history/")) {
        const storeId = Number(url.split("/").pop());
        const store = stores.find((s) => s.id === storeId);
        return Promise.resolve({
          data: {
            success: true,
            data: store
              ? { ...mockStoreHistory, ...store, stats: mockStoreHistory.stats }
              : mockStoreHistory,
          },
        } as never);
      }
      return originalGet(url, config as never);
    }) as typeof axiosInstance.get;
    return () => {
      axiosInstance.get = originalGet;
    };
  }, [stores]);

  return (
    <QueryClientProvider client={queryClient}>
      <StoreStats stores={stores} />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Dashboard/StoreStats",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Per-store monthly stats cards with growth indicators and history dialog. Mocks store history API.",
      },
    },
  },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <StoryWrapper />,
};

export const Empty: Story = {
  render: () => <StoryWrapper stores={[]} />,
};
