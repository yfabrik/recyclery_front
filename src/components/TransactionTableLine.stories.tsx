import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table, TableBody } from "@mui/material";
import type { TransactionModel } from "../interfaces/Models";
import { TransactionTableLine } from "./TransactionTableLine";

const nowIso = new Date().toISOString();

const baseTransaction: TransactionModel = {
  id: 1001,
  createdAt: nowIso,
  change_amount: 0,
  total_amount: 45.5,
  payment_method: "card",
  transactionType: "sell",
  payment_amount: 45.5,
  status: "completed",
  cash_session_id: 1,
  CashSession: {
    id: 1,
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
      Recyclery: { id: 1, createdAt: nowIso, name: "Recyclerie Centre", address: null, phone: null, email: null, city: null, postal_code: null, is_active: true, manager_id: null },
    },
    User: {
      id: 1,
      createdAt: nowIso,
      username: "caissier",
      email: "caissier@recyclerie.fr",
      role: "employee",
      isActive: true,
      last_login: nowIso,
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
