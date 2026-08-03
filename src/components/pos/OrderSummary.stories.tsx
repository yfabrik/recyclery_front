import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import type { CartFormOutput } from "../../services/schema/cart";
import {
  formatCurrency,
  getCartTotal,
  getCartTotalWithGlobalPromotion,
  getGlobalPromotionDiscount,
  getPaymentBalance,
  roundCurrency,
} from "../../services/cartService";
import {
  floatThreeLinesCart,
  globalPromoCart,
  makeCartItem,
} from "../../stories/fixtures/posCart";
import {
  matchFormattedCurrency,
  normalizeMoneyText,
} from "../../stories/matchCurrency";
import { OrderSummary } from "./OrderSummary";

type SummaryArgs = {
  cart: CartFormOutput["cart"];
  globalPromotion: CartFormOutput["global_promotion"];
};

function OrderSummaryHarness({ cart, globalPromotion }: SummaryArgs) {
  const cartSubtotal = getCartTotal(cart);
  const globalPromotionDiscount = getGlobalPromotionDiscount(
    cartSubtotal,
    globalPromotion,
  );
  const due = getCartTotalWithGlobalPromotion(cart, globalPromotion);
  return (
    <OrderSummary
      cart={cart}
      cartSubtotal={cartSubtotal}
      globalPromotionDiscount={globalPromotionDiscount}
      paymentBalance={getPaymentBalance(0, due)}
      globalPromotion={globalPromotion}
    />
  );
}

const meta = {
  title: "POS/OrderSummary",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;

type Story = StoryObj;

const noPromo = { type: "percent" as const, value: 0 };

const expectDueAmount = (
  canvas: ReturnType<typeof within>,
  amount: number,
) => {
  const dueLabel = canvas.getByText("Total à payer");
  const row = dueLabel.parentElement;
  expect(row).toBeTruthy();
  expect(normalizeMoneyText(row!.textContent ?? "")).toContain(
    normalizeMoneyText(formatCurrency(amount)),
  );
};

export const MultiItem: Story = {
  render: () => (
    <OrderSummaryHarness
      cart={[
        makeCartItem({ name: "A", price: 2.5, quantity: 2 }),
        makeCartItem({ name: "B", price: 1.25, quantity: 4, barcode: "B" }),
      ]}
      globalPromotion={noPromo}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Sous-total")).toBeInTheDocument();
    expectDueAmount(canvas, roundCurrency(10));
    await expect(canvas.getByText("Total à payer")).toBeInTheDocument();
  },
};

export const PackLine: Story = {
  render: () => (
    <OrderSummaryHarness
      cart={[
        makeCartItem({
          name: "Pack",
          price: 4.99,
          quantity: 3,
          bundlePrice: 9.99,
          bundleQuantity: 3,
        }),
      ]}
      globalPromotion={noPromo}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expectDueAmount(canvas, roundCurrency(9.99));
  },
};

export const LinePromo: Story = {
  render: () => (
    <OrderSummaryHarness
      cart={[
        makeCartItem({
          name: "Promo",
          price: 3.33,
          quantity: 3,
          promotion: 10,
        }),
      ]}
      globalPromotion={noPromo}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expectDueAmount(canvas, roundCurrency(3.33 * 3 * 0.9));
  },
};

export const GlobalPromo: Story = {
  render: () => (
    <OrderSummaryHarness
      cart={globalPromoCart}
      globalPromotion={{ type: "percent", value: 33 }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const due = roundCurrency(
      getCartTotalWithGlobalPromotion(globalPromoCart, {
        type: "percent",
        value: 33,
      }),
    );
    const discount = roundCurrency(
      getGlobalPromotionDiscount(getCartTotal(globalPromoCart), {
        type: "percent",
        value: 33,
      }),
    );
    await expect(
      canvas.getByText(/Promotion globale \(33%\)/),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(matchFormattedCurrency(discount, "-")),
    ).toBeInTheDocument();
    expectDueAmount(canvas, due);
  },
};

export const FloatThreeLines: Story = {
  render: () => (
    <OrderSummaryHarness
      cart={floatThreeLinesCart}
      globalPromotion={noPromo}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expectDueAmount(canvas, roundCurrency(0.9));
  },
};
