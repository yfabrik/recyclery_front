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
  updatedAt: nowIso,
  opening_amount: 100,
  closing_amount: null,
  expected_amount: null,
  difference_amount: 0,
  status: "open",
  notes: null,
  closed_at: null,
  cash_register_id: 11,
  user_id: 1,
  CashRegister: {
    id: 11,
    name: "Caisse A",
    is_active: true,
    recyclery_id: 1,
  },
};

const mockTransactions: TransactionModel[] = [
  {
    id: 2001,
    createdAt: nowIso,
    updatedAt: nowIso,
    change_amount: 0,
    total_amount: 45.5,
    payment_method: "card",
    transactionType: "sell",
    payment_amount: 45.5,
    status: "completed",
    created_by: 1,
    total_amount_before_promotion: 45.5,
    cash_session_id: 101,
    customer_name: null,
    customer_email: null,
    customer_postal_code: null,
    transactionId: null,
    global_promotion: null,
    global_promotion_type: null,
    CashSession: {
      ...activeSession,
      User: {
        id: 1,
        username: "caissier",
        email: "caissier@recyclerie.fr",
        role: "employee",
      },
      CashRegister: {
        ...activeSession.CashRegister!,
        Recyclery: {
          id: 1,
          name: "Recyclerie Centre",
          city: "Lille",
          is_active: true,
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
          data: { success: true, data: mockCategories },
        } as never);
      }
      if (url === "/api/sales-transactions") {
        return Promise.resolve({
          data: {
            success: true,
            data: empty ? [] : mockTransactions,
            pagination: {
              total: empty ? 0 : 1,
              page: 1,
              perPage: 50,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false,
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
