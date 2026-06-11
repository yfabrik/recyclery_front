import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { ArrivalModel } from "../interfaces/Models";
import axiosInstance from "../services/api/axios";
import { ArrivalHistory } from "./ArrivalHistory";

const nowIso = new Date().toISOString();

const categoryBase = {
  description: null as string | null,
  icon: null as string | null,
  parent_id: null as number | null,
  defaultWeight: 0.5,
  defaultPrice: 5,
  IO: 1,
  priceBasedOnWeight: false,
  bundlePrice: 0,
  bundleQuantity: 0,
};

const mockArrivals: ArrivalModel[] = [
  {
    id: 1,
    createdAt: nowIso,
    category_id: 1,
    subcategory_id: 11,
    weight: 25.5,
    arrival_date: nowIso,
    arrival_time: "10:30",
    source_type: "point",
    collection_point_id: 1,
    source_details: "",
    notes: "",
    status: "completed",
    processed_by: 1,
    categorie: { id: 1, createdAt: nowIso, name: "Vêtements", ...categoryBase },
    subcategorie: { id: 11, createdAt: nowIso, name: "Homme", ...categoryBase, parent_id: 1 },
    User: { id: 1, createdAt: nowIso, username: "marie", email: "marie@recyclerie.fr", role: "employee", isActive: true, last_login: nowIso },
  },
  {
    id: 2,
    createdAt: nowIso,
    category_id: 2,
    subcategory_id: 0,
    weight: 8,
    arrival_date: nowIso,
    arrival_time: "14:15",
    source_type: "apport",
    collection_point_id: 0,
    source_details: "Don volontaire",
    notes: "",
    status: "completed",
    processed_by: 1,
    categorie: { id: 2, createdAt: nowIso, name: "Livres", ...categoryBase, defaultWeight: 0.3, defaultPrice: 2 },
    User: { id: 1, createdAt: nowIso, username: "marie", email: "marie@recyclerie.fr", role: "employee", isActive: true, last_login: nowIso },
  },
];

function StoryWrapper({ empty = false }: { empty?: boolean }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );

  useEffect(() => {
    const originalGet = axiosInstance.get.bind(axiosInstance);
    axiosInstance.get = ((url: string, config?: unknown) => {
      if (url === "/api/arrivals") {
        return Promise.resolve({
          data: {
            message: "ok",
            arrivals: empty ? [] : mockArrivals,
            pagination: {
              total: empty ? 0 : mockArrivals.length,
              page: 1,
              total_pages: 1,
              items_per_page: 50,
              has_next: false,
              has_previous: false,
              limit: 50,
              offset: 0,
            },
          },
        } as never);
      }
      if (url === "/api/collection-points") {
        return Promise.resolve({
          data: { message: "ok", collection_points: [] },
        } as never);
      }
      return originalGet(url, config as never);
    }) as typeof axiosInstance.get;
    return () => {
      axiosInstance.get = originalGet;
    };
  }, [empty]);

  return (
    <QueryClientProvider client={queryClient}>
      <ArrivalHistory />
    </QueryClientProvider>
  );
}

const meta = {
  title: "POS/ArrivalHistory",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Arrival history table with ArrivalFilterForm and pagination.",
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
  render: () => <StoryWrapper empty />,
};
