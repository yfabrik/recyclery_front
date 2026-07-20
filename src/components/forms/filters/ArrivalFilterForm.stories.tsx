import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { mockCollectionPoints } from "../../../stories/fixtures";
import axiosInstance from "../../../services/api/axios";
import { ArrivalFilterForm } from "./ArrivalFilterForm";

function StoryWrapper() {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const originalGet = axiosInstance.get.bind(axiosInstance);
    axiosInstance.get = ((url: string, config?: unknown) => {
      if (url === "/api/collection-points") {
        return Promise.resolve({
          data: { message: "ok", collection_points: mockCollectionPoints },
        } as never);
      }
      return originalGet(url, config as never);
    }) as typeof axiosInstance.get;
    return () => {
      axiosInstance.get = originalGet;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ArrivalFilterForm
        defaultValues={{
          date_from: new Date(today),
          date_to: new Date(today),
          source_type: "",
          collection_point_id: "",
        }}
        onChange={(values) => console.log("[arrival filters]", values)}
      />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Forms/ArrivalFilterForm",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Debounced arrival history filters (date range, source type, collection point).",
      },
    },
  },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
