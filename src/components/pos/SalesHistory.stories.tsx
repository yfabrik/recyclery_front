import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { CashSession, TransactionModel } from "../../interfaces/Models";
import { mockCategories } from "../../stories/fixtures";
import axiosInstance from "../../services/api/axios";
import { SalesHistory } from "./SalesHistory";

const nowIso = new Date().toISOString();

const activeSession: CashSession = {
  id: 101,
  createdAt: nowIso,
  opening_amount: 100,
  difference_amount: 0,
  status: "open",
  cash_register_id: 11,
  user_id: 1,
  CashRegister: {
    id: 11,
    createdAt: nowIso,
    name: "Caisse A",
    is_active: true,
    recyclery_id: 1,
  },
};

const mockTransactions: TransactionModel[] = [
  {
    id: 2001,
    createdAt: nowIso,
    change_amount: 0,
    total_amount: 45.5,
    payment_method: "card",
    transactionType: "sell",
    payment_amount: 45.5,
    status: "completed",
    cash_session_id: 101,
    CashSession: {
      ...activeSession,
      User: {
        id: 1,
        createdAt: nowIso,
        username: "caissier",
        email: "caissier@recyclerie.fr",
        role: "employee",
        isActive: true,
        last_login: nowIso,
      },
      CashRegister: {
        ...activeSession.CashRegister!,
        Recyclery: {
          id: 1,
          createdAt: nowIso,
          name: "Recyclerie Centre",
          address: null,
          phone: null,
          email: null,
          city: null,
          postal_code: null,
          is_active: true,
          manager_id: null,
        },
      },
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
      if (url === "/api/categories") {
        return Promise.resolve({
          data: { categories: mockCategories },
        } as never);
      }
      if (url === "/api/sales-transactions") {
        return Promise.resolve({
          data: {
            message: "ok",
            transactions: empty ? [] : mockTransactions,
            pagination: {
              total: empty ? 0 : 1,
              page: 1,
              total_pages: 1,
            },
          },
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
      <SalesHistory activeSession={activeSession} />
    </QueryClientProvider>
  );
}

const meta = {
  title: "POS/SalesHistory",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "POS sales history with filters, refund flow, and transaction detail dialog. Mocks categories and transactions APIs.",
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
