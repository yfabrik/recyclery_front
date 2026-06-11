import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type {
  CategoryModel,
  TransactionModel,
  TransactionPayment,
} from "../interfaces/Models";
import type { RefundTransaction } from "../services/api/transactions";
import axiosInstance from "../services/api/axios";
import { DetailTransaction } from "./DetailTransaction";

const nowIso = new Date().toISOString();

const mockCategories: CategoryModel[] = [
  {
    id: 1,
    createdAt: nowIso,
    name: "Vêtements",
    description: null,
    icon: null,
    parent_id: null,
    defaultWeight: 0.5,
    defaultPrice: 5,
    IO: 1,
    priceBasedOnWeight: false,
    bundlePrice: 10,
    bundleQuantity: 3,
    subcategories: [
      {
        id: 11,
        createdAt: nowIso,
        name: "Homme",
        description: null,
        icon: null,
        parent_id: 1,
        defaultWeight: 0.5,
        defaultPrice: 5,
        IO: 1,
        priceBasedOnWeight: false,
        bundlePrice: 0,
        bundleQuantity: 0,
      },
    ],
  },
  {
    id: 2,
    createdAt: nowIso,
    name: "Livres",
    description: null,
    icon: null,
    parent_id: null,
    defaultWeight: 0.3,
    defaultPrice: 2,
    IO: 1,
    priceBasedOnWeight: false,
    bundlePrice: 0,
    bundleQuantity: 0,
    subcategories: [],
  },
];

const mockPayments: TransactionPayment[] = [
  {
    id: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
    method: "cash",
    amount: 12,
    gift_card_id: null,
    sales_transaction_id: 1001,
  },
  {
    id: 2,
    createdAt: nowIso,
    updatedAt: nowIso,
    method: "card",
    amount: 8.5,
    gift_card_id: null,
    sales_transaction_id: 1001,
  },
];

const mockTransaction: TransactionModel = {
  id: 1001,
  createdAt: nowIso,
  updatedAt: nowIso,
  change_amount: 0.5,
  total_amount: 20.5,
  total_amount_before_promotion: 25,
  payment_method: "mixed",
  payment_amount: 21,
  transactionType: "sell",
  customer_postal_code: "59000",
  status: "completed",
  cash_session_id: 501,
  created_by: 1,
  global_promotion: 40,
  global_promotion_type: "percent",
  CashSession: {
    id: 501,
    createdAt: nowIso,
    opening_amount: 100,
    difference_amount: 0,
    status: "open",
    cash_register_id: 11,
    user_id: 1,
    User: {
      id: 1,
      createdAt: nowIso,
      username: "marie.dupont",
      email: "marie@recyclerie.fr",
      role: "employee",
      isActive: true,
      last_login: nowIso,
    },
    Recyclery: { name: "Recyclerie Centre" },
  },
  items: [
    {
      id: 201,
      createdAt: nowIso,
      recyclery_id: 1,
      category_id: 1,
      subcategory_id: 11,
      soldBy: 1,
      created_by: 1,
      barcode: "1234567890123",
      description: null,
      weight: 0.4,
      price: 8,
      cost: null,
      condition_state: "good",
      status: "sold",
      category: { name: "Vêtements" },
      subcategory: { name: "Homme" },
      TransactionItem: {
        bundlePrice: 10,
        bundleQuantity: 3,
        labeled_item_id: 201,
        name: "Pantalon jean",
        price: 8,
        promotionValue: 10,
        quantity: 3,
        total_price: 21.6,
        transaction_id: 1001,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    },
    {
      id: 202,
      createdAt: nowIso,
      recyclery_id: 1,
      category_id: 2,
      subcategory_id: null,
      soldBy: 1,
      created_by: 1,
      barcode: "manual-001",
      description: "Roman policier",
      weight: 0.3,
      price: 3,
      cost: null,
      condition_state: "good",
      status: "sold",
      category: { name: "Livres" },
      subcategory: null,
      TransactionItem: {
        bundlePrice: 0,
        bundleQuantity: 0,
        labeled_item_id: 202,
        name: "Roman policier",
        price: 3,
        promotionValue: 0,
        quantity: 1,
        total_price: 3,
        transaction_id: 1001,
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    },
  ],
  payments: mockPayments,
};

const mockRefunds: RefundTransaction[] = [
  {
    id: 1002,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updatedAt: nowIso,
    change_amount: 0,
    total_amount: 5,
    total_amount_before_promotion: 5,
    payment_method: "cash",
    payment_amount: 5,
    transactionType: "refund",
    status: "completed",
    cash_session_id: 501,
    created_by: 1,
    refund_reason: "customer_request",
    refund_type: "partial",
    CashSession: mockTransaction.CashSession,
    items: [],
  },
];

function installTransactionMocks() {
  const originalGet = axiosInstance.get.bind(axiosInstance);

  axiosInstance.get = ((url: string, config?: unknown) => {
    if (url === "/api/sales-transactions/1001") {
      return Promise.resolve({
        data: {
          success: true,
          transaction: {
            ...mockTransaction,
            payments: mockPayments,
            giftCard: null,
            User: mockTransaction.CashSession?.User ?? null,
          },
        },
      } as never);
    }
    if (url === "/api/sales-transactions/1001/refunds") {
      return Promise.resolve({
        data: { success: true, refunds: mockRefunds },
      } as never);
    }
    return originalGet(url, config as never);
  }) as typeof axiosInstance.get;

  return () => {
    axiosInstance.get = originalGet;
  };
}

interface DetailTransactionStoryProps {
  editable?: boolean;
}

function DetailTransactionStory({ editable = false }: DetailTransactionStoryProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  );

  useEffect(() => installTransactionMocks(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <DetailTransaction
        selectedTransaction={mockTransaction}
        categories={mockCategories}
        editable={editable}
      />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Components/DetailTransaction",
  component: DetailTransactionStory,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Transaction detail view with items, payments, promos, and refund history. Set `editable` to adjust quantities and payment lines locally (no API save).",
      },
    },
  },
  argTypes: {
    editable: {
      control: "boolean",
      description: "Allow local edits to quantities and payments.",
    },
  },
} satisfies Meta<typeof DetailTransactionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Read-only detail loaded from mocked API. */
export const Default: Story = {
  args: { editable: false },
};

/** Editable mode: change item quantities and payment lines (not persisted). */
export const Editable: Story = {
  args: { editable: true },
};
