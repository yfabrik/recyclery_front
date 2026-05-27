import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axiosInstance from "../../services/api/axios";
import { NoOpenedRegister } from "./NoOpenedRegister";

const nowIso = new Date().toISOString();
const storesResponse = {
  message: "ok",
  stores: [
    {
      id: 1,
      createdAt: nowIso,
      updatedAt: nowIso,
      manager_id: null,
      name: "Recyclerie Centre",
      address: "12 rue des Ateliers",
      phone: null,
      email: null,
      city: "Lille",
      postal_code: "59000",
      is_active: true,
      caisses: [
        {
          id: 11,
          createdAt: nowIso,
          updatedAt: nowIso,
          name: "Caisse A",
          is_active: true,
          recyclery_id: 1,
          total_sessions: 12,
        },
      ],
    },
  ],
};

const registerDetailsResponse = {
  message: "ok",
  data: {
    store_name: "Recyclerie Centre",
    total_sessions: 2,
    last_session: new Date().toISOString(),
    sessions: [
      {
        id: 1101,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: nowIso,
        opening_amount: 100,
        closing_amount: 350,
        expected_amount: 348,
        difference_amount: -2,
        status: "close",
        closed_at: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
        cash_register_id: 11,
        user_id: 1,
      },
      {
        id: 1102,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
        updatedAt: nowIso,
        opening_amount: 120,
        closing_amount: 410,
        expected_amount: 410,
        difference_amount: 0,
        status: "close",
        closed_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
        cash_register_id: 11,
        user_id: 1,
      },
    ],
  },
};

const sessionDetailsResponse = {
  message: "ok",
  session: {
    ...registerDetailsResponse.data.sessions[0],
    SalesTransactions: [],
  },
};
function StoryWrapper() {
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
    const originalPost = axiosInstance.post.bind(axiosInstance);

    axiosInstance.get = ((url: string, config?: unknown) => {
      if (url === "/api/recycleries") {
        return Promise.resolve({ data: storesResponse } as never);
      }
      if (url === "/api/cash-registers/11") {
        return Promise.resolve({ data: registerDetailsResponse } as never);
      }
      if (url === "/api/cash-sessions/1101" || url === "/api/cash-sessions/1102") {
        return Promise.resolve({ data: sessionDetailsResponse } as never);
      }
      return originalGet(url, config as never);
    }) as typeof axiosInstance.get;

    axiosInstance.post = ((url: string, data?: unknown, config?: unknown) => {
      if (url === "/api/cash-sessions/open") {
        return Promise.resolve({
          data: { message: "Session ouverte", session: sessionDetailsResponse.session },
        } as never);
      }
      return originalPost(url, data as never, config as never);
    }) as typeof axiosInstance.post;

    return () => {
      axiosInstance.get = originalGet;
      axiosInstance.post = originalPost;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NoOpenedRegister />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Components/POS/NoOpenedRegister",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof StoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const HistoryDialogOpened: Story = {
  play: async ({ canvasElement }) => {
    const historyButtons = canvasElement.querySelectorAll('button[title="Voir historique"]');
    if (!historyButtons.length) throw new Error("History button not found");
    (historyButtons[0] as HTMLButtonElement).click();
  },
};
