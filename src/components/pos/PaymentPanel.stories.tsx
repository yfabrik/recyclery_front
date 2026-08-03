import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { expect, fn, userEvent, within } from "storybook/test";
import type { CartFormOutput, CartFormValues } from "../../services/schema/cart";
import {
  getCartTotalWithGlobalPromotion,
  roundCurrency,
} from "../../services/cartService";
import {
  buildCartForm,
  floatThreeLinesCart,
  fractionalGlobalPromoCart,
  globalPromoCart,
  multiPayForm,
} from "../../stories/fixtures/posCart";
import { PaymentPanel } from "./PaymentPanel";

type HarnessProps = {
  defaults: CartFormOutput;
  onSubmit?: (data: CartFormOutput) => void;
};

type SubmitSpy = ReturnType<typeof fn>;

const SUBMIT_SPY_KEY = "__posPaymentSubmitSpy";

const getSubmitSpy = () =>
  (globalThis as unknown as Record<string, SubmitSpy | undefined>)[SUBMIT_SPY_KEY];

const setSubmitSpy = (spy: SubmitSpy) => {
  (globalThis as unknown as Record<string, SubmitSpy | undefined>)[SUBMIT_SPY_KEY] =
    spy;
};

function PaymentPanelHarness({ defaults, onSubmit }: HarnessProps) {
  const form = useForm<CartFormValues, unknown, CartFormOutput>({
    defaultValues: defaults,
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "payment_splits",
  });
  const [giftCardScanInput, setGiftCardScanInput] = useState("");

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          onSubmit?.(data);
        })}
      >
        <PaymentPanel
          paymentFields={fields}
          appendPayment={append}
          removePayment={remove}
          giftCardScanInput={giftCardScanInput}
          setGiftCardScanInput={setGiftCardScanInput}
          onScanGiftCard={() => undefined}
        />
      </form>
    </FormProvider>
  );
}

const meta = {
  title: "POS/PaymentPanel",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj;

export const UnderpayDisabled: Story = {
  render: () => (
    <PaymentPanelHarness
      defaults={buildCartForm(globalPromoCart, {
        global_promotion: { type: "percent", value: 33 },
        payment_splits: [{ method: "cash", amount: 1 }],
      })}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole("button", { name: /Encaisser/i });
    await expect(submit).toBeDisabled();
  },
};

export const ExactPayFloatEnabled: Story = {
  render: () => (
    <PaymentPanelHarness defaults={buildCartForm(floatThreeLinesCart)} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = canvas.getByRole("button", { name: /Encaisser/i });
    await expect(submit).toBeEnabled();
  },
};

export const GlobalPromoExactPaySubmit: Story = {
  render: () => {
    const onSubmit = fn((data: CartFormOutput) => data).mockName("onSubmit");
    setSubmitSpy(onSubmit);
    return (
      <PaymentPanelHarness
        defaults={buildCartForm(fractionalGlobalPromoCart, {
          global_promotion: { type: "percent", value: 10 },
        })}
        onSubmit={onSubmit as (data: CartFormOutput) => void}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const due = roundCurrency(
      getCartTotalWithGlobalPromotion(fractionalGlobalPromoCart, {
        type: "percent",
        value: 10,
      }),
    );
    expect(due).toBe(20.98);

    const submit = canvas.getByRole("button", { name: /Encaisser/i });
    await expect(submit).toBeEnabled();
    await userEvent.click(submit);

    const onSubmit = getSubmitSpy()!;
    await expect(onSubmit).toHaveBeenCalled();
    const payload = onSubmit.mock.calls[0]?.[0] as CartFormOutput;
    expect(payload.global_promotion).toEqual({ type: "percent", value: 10 });
    expect(
      roundCurrency(
        payload.payment_splits.reduce((sum, s) => sum + s.amount, 0),
      ),
    ).toBe(due);
  },
};

export const MultiPaymentMethodsEnabled: Story = {
  render: () => <PaymentPanelHarness defaults={multiPayForm} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("button", { name: /Encaisser/i }),
    ).toBeEnabled();
    await expect(
      canvas.getByLabelText(/Mode de paiement #1/i),
    ).toBeInTheDocument();
    await expect(
      canvas.getByLabelText(/Mode de paiement #2/i),
    ).toBeInTheDocument();
  },
};
