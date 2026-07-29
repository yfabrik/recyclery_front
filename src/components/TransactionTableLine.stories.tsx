import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableBody } from "@mui/material";
import type { TransactionModel } from "../interfaces/Models";
import { TransactionTableLine } from "./TransactionTableLine";

const nowIso = new Date().toISOString();

const baseTransaction: TransactionModel = {
  id: 1001,
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
  cash_session_id: 1,
  customer_name: null,
  customer_email: null,
  customer_postal_code: null,
  transactionId: null,
  global_promotion: null,
  global_promotion_type: null,
  CashSession: {
    id: 1,
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
      Recyclery: {
        id: 1,
        name: "Recyclerie Centre",
        city: "Lille",
        is_active: true,
      },
    },
    User: {
      id: 1,
      username: "caissier",
      email: "caissier@recyclerie.fr",
      role: "employee",
    },
  },
};

const handlers = {
  handleReprintReceipt: (id: number) => console.log("reprint", id),
  handleRefund: (t: TransactionModel) => console.log("refund", t.id),
  handleShowDetail: (t: TransactionModel) => console.log("detail", t.id),
};

const meta = {
  title: "POS/TransactionTableLine",
  component: TransactionTableLine,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Single transaction row for sales history tables with action buttons.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Table>
        <TableBody>
          <Story />
        </TableBody>
      </Table>
    ),
  ],
} satisfies Meta<typeof TransactionTableLine>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SellRow: Story = {
  args: {
    transaction: baseTransaction,
    ...handlers,
  },
};

export const EditableRow: Story = {
  args: {
    transaction: baseTransaction,
    currentCashSessionId: 1,
    ...handlers,
  },
};

export const RefundRow: Story = {
  args: {
    transaction: {
      ...baseTransaction,
      id: 1002,
      transactionType: "refund",
      total_amount: -15,
      payment_method: "cash",
    },
    ...handlers,
    handleRefund: undefined,
  },
};
