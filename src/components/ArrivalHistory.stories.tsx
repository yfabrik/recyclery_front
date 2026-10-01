import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthProvider } from "../contexts/AuthContext";
import type { ArrivalModel } from "../interfaces/Models";
import axiosInstance from "../services/api/axios";
import { ArrivalHistory } from "./ArrivalHistory";

const nowIso = new Date().toISOString();

const mockArrivals: ArrivalModel[] = [
  {
    id: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
    category_id: 1,
    subcategory_id: 11,
    weight: 25.5,
    arrival_date: nowIso,
    arrival_time: "10:30",
    source_type: "point",
    collection_point_id: 1,
    source_details: "",
    notes: "",
    status: "received",
    processed_by: 1,
    categorie: {
      id: 1,
      name: "Vêtements",
      description: null,
      icon: null,
      parent_id: null,
    },
    subcategorie: {
      id: 11,
      name: "Homme",
      description: null,
      icon: null,
      parent_id: 1,
    },
    User: {
      id: 1,
      username: "marie",
      email: "marie@recyclerie.fr",
      role: "employee",
    },
  },
  {
    id: 2,
    createdAt: nowIso,
    updatedAt: nowIso,
    category_id: 2,
    subcategory_id: null,
    weight: 8,
    arrival_date: nowIso,
    arrival_time: "14:15",
    source_type: "apport",
    collection_point_id: null,
    source_details: "Don volontaire",
    notes: "",
    status: "received",
    processed_by: 1,
    categorie: {
      id: 2,
      name: "Livres",
      description: null,
      icon: null,
      parent_id: null,
    },
    User: {
      id: 1,
      username: "marie",
      email: "marie@recyclerie.fr",
      role: "employee",
    },
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
            success: true,
            data: empty ? [] : mockArrivals,
            pagination: {
              total: empty ? 0 : mockArrivals.length,
              page: 1,
              perPage: 50,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
            },
          },
        } as never);
      }
      if (url === "/api/collection-points") {
        return Promise.resolve({
          data: { success: true, data: [] },
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
      <AuthProvider>
        <ArrivalHistory />
      </AuthProvider>
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
