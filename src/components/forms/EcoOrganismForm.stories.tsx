import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { noopSubmit, mockCategories } from "../../stories/fixtures";
import { EcoOrganismForm } from "./EcoOrganismForm";
import axiosInstance from "../../services/api/axios";

const meta = {
  title: "Forms/EcoOrganismForm",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Eco-organism partner contact and status form.",
      },
    },
  },
  args: {
    formId: "eco-organism-form",
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function StoryWrapper(props: ComponentProps<typeof EcoOrganismForm>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
        },
      }),
  );

  useEffect(() => {
    const originalGet = axiosInstance.get.bind(axiosInstance);

    axiosInstance.get = ((url: string, config?: unknown) => {
      if (url === "/api/categories") {
        return Promise.resolve({
          data: { success: true, data: mockCategories },
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
      <EcoOrganismForm {...props} />
    </QueryClientProvider>
  );
}
