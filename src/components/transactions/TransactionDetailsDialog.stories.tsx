import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { mockCategories } from "../../stories/fixtures";
import {
  formatCurrency,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  roundCurrency,
} from "../../services/cartService";
import { buildUpdateTransactionBody } from "../../services/mapper/cart";
import axiosInstance from "../../services/api/axios";
import type { CartFormOutput } from "../../services/schema/cart";
import {
  fractionalGlobalPromo10Form,
  globalPromo33Form,
  makeSellTransaction,
} from "../../stories/fixtures/posCart";
import {
  matchFormattedCurrency,
  normalizeMoneyText,
} from "../../stories/matchCurrency";
import { TransactionDetailsDialog } from "./TransactionDetailsDialog";

type HarnessProps = {
  form: CartFormOutput;
  underpay?: boolean;
  onSubmit?: (data: CartFormOutput) => void;
};

type SubmitSpy = ReturnType<typeof fn>;

const SUBMIT_SPY_KEY = "__posEditSubmitSpy";

const getSubmitSpy = () =>
  (globalThis as unknown as Record<string, SubmitSpy | undefined>)[SUBMIT_SPY_KEY];

const setSubmitSpy = (spy: SubmitSpy) => {
  (globalThis as unknown as Record<string, SubmitSpy | undefined>)[SUBMIT_SPY_KEY] =
    spy;
};

/** Dialog portals to document.body — locate portal there, then scope to dialog. */
const dialogScreen = (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);
  return within(body.getByRole("dialog"));
};

function DialogHarness({
  form,
  underpay = false,
  onSubmit,
}: HarnessProps) {
  const transaction = useMemo(() => {
    const formValues = underpay
      ? {
          ...form,
          payment_splits: [{ method: "cash" as const, amount: 1 }],
        }
      : form;
    const tx = makeSellTransaction(formValues);
    if (underpay) {
      tx.total_amount = roundCurrency(
        getCartTotalWithGlobalPromotion(form.cart, form.global_promotion),
      );
      tx.payment_amount = 1;
      tx.payments = [
        {
          id: 1,
          method: "cash",
          amount: 1,
          metadata: null,
          sales_transaction_id: tx.id,
          gift_card_id: null,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        },
      ];
    }
    return tx;
  }, [form, underpay]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
  );

  // Seed details so Enregistrer is enabled immediately.
  queryClient.setQueryData(["transactionDetails", transaction.id], transaction);

  useEffect(() => {
    const originalGet = axiosInstance.get.bind(axiosInstance);
    axiosInstance.get = ((url: string, config?: unknown) => {
      if (url === `/api/sales-transactions/${transaction.id}`) {
        return Promise.resolve({
          data: { success: true, data: transaction },
        } as never);
      }
      if (url === `/api/sales-transactions/${transaction.id}/refunds`) {
        return Promise.resolve({
          data: { success: true, data: { refunds: [] } },
        } as never);
      }
      return originalGet(url, config as never);
    }) as typeof axiosInstance.get;

    return () => {
      axiosInstance.get = originalGet;
    };
  }, [transaction]);

  return (
    <QueryClientProvider client={queryClient}>
      <TransactionDetailsDialog
        open
        onClose={() => undefined}
        transaction={transaction}
        categories={mockCategories}
        editable
        onSubmit={onSubmit}
      />
    </QueryClientProvider>
  );
}

const meta = {
  title: "POS/TransactionDetailsDialog",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;

type Story = StoryObj;

const expectDueAmount = (
  screen: ReturnType<typeof within>,
  amount: number,
) => {
  const dueLabel = screen.getByText("Total à payer");
  const row = dueLabel.parentElement;
  expect(row).toBeTruthy();
  expect(normalizeMoneyText(row!.textContent ?? "")).toContain(
    normalizeMoneyText(formatCurrency(amount)),
  );
};

export const EditShowsGlobalPromoTotals: Story = {
  render: () => {
    const onSubmit = fn((data: CartFormOutput) => data).mockName("onSubmit");
    return <DialogHarness form={globalPromo33Form} onSubmit={onSubmit} />;
  },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    await waitFor(() =>
      expect(screen.getByText(/Modifier la Transaction #/)).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Promotion globale \(33%\)/),
      ).toBeInTheDocument(),
    );
    const due = roundCurrency(
      getCartTotalWithGlobalPromotion(
        globalPromo33Form.cart,
        globalPromo33Form.global_promotion,
      ),
    );
    const subtotal = roundCurrency(getCartTotal(globalPromo33Form.cart));
    expectDueAmount(screen, due);
    await expect(
      screen.getAllByText(matchFormattedCurrency(subtotal)).length,
    ).toBeGreaterThan(0);
  },
};

export const EditChangePromoUpdatesDue: Story = {
  render: () => {
    const onSubmit = fn((data: CartFormOutput) => data).mockName("onSubmit");
    return <DialogHarness form={globalPromo33Form} onSubmit={onSubmit} />;
  },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    await waitFor(() =>
      expect(
        screen.getByText(/Promotion globale \(33%\)/),
      ).toBeInTheDocument(),
    );

    const promoValue = screen.getByLabelText(/^Valeur$/i);
    await userEvent.clear(promoValue);
    await userEvent.type(promoValue, "10");

    const expectedDue = roundCurrency(
      getCartTotalWithGlobalPromotion(globalPromo33Form.cart, {
        type: "percent",
        value: 10,
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/Promotion globale \(10%\)/),
      ).toBeInTheDocument(),
    );
    await waitFor(() => {
      expectDueAmount(screen, expectedDue);
    });
  },
};

export const EditSaveSuccess: Story = {
  render: () => {
    const onSubmit = fn((data: CartFormOutput) => data).mockName("onSubmit");
    setSubmitSpy(onSubmit);
    return (
      <DialogHarness
        form={globalPromo33Form}
        onSubmit={onSubmit as (data: CartFormOutput) => void}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Enregistrer/i }),
      ).toBeEnabled(),
    );
    await userEvent.click(
      screen.getByRole("button", { name: /Enregistrer/i }),
    );

    const onSubmit = getSubmitSpy()!;
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0]?.[0] as CartFormOutput;
    const mapped = buildUpdateTransactionBody(payload, 101);
    expect(mapped.global_promotion).toBe(33);
    expect(mapped.total_amount).toBe(4.02);
  },
};

export const EditUnderpayDoesNotSubmit: Story = {
  render: () => {
    const onSubmit = fn((data: CartFormOutput) => data).mockName("onSubmit");
    setSubmitSpy(onSubmit);
    return (
      <DialogHarness
        form={globalPromo33Form}
        underpay
        onSubmit={onSubmit as (data: CartFormOutput) => void}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const save = await waitFor(() =>
      screen.getByRole("button", { name: /Enregistrer/i }),
    );
    await expect(save).toBeEnabled();
    await userEvent.click(save);

    await new Promise((r) => setTimeout(r, 300));
    expect(getSubmitSpy()).not.toHaveBeenCalled();
  },
};

export const FractionalGlobalPromoTotals: Story = {
  render: () => {
    const onSubmit = fn((data: CartFormOutput) => data).mockName("onSubmit");
    return (
      <DialogHarness form={fractionalGlobalPromo10Form} onSubmit={onSubmit} />
    );
  },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const due = roundCurrency(
      getCartTotalWithGlobalPromotion(
        fractionalGlobalPromo10Form.cart,
        fractionalGlobalPromo10Form.global_promotion,
      ),
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Promotion globale \(10%\)/),
      ).toBeInTheDocument(),
    );
    expectDueAmount(screen, due);
  },
};
