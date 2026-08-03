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
  component: OrderSummaryHarness,
  tags: ["autodocs"],
} satisfies Meta<typeof OrderSummaryHarness>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MultiItem: Story = {
  args: {
    cart: [
      makeCartItem({ name: "A", price: 2.5, quantity: 2 }),
      makeCartItem({ name: "B", price: 1.25, quantity: 4, barcode: "B" }),
    ],
    globalPromotion: { type: "percent", value: 0 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Sous-total")).toBeInTheDocument();
    await expect(canvas.getByText(formatCurrency(10))).toBeInTheDocument();
    await expect(canvas.getByText("Total à payer")).toBeInTheDocument();
  },
};

export const PackLine: Story = {
  args: {
    cart: [
      makeCartItem({
        name: "Pack",
        price: 4.99,
        quantity: 3,
        bundlePrice: 9.99,
        bundleQuantity: 3,
      }),
    ],
    globalPromotion: { type: "percent", value: 0 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(formatCurrency(9.99))).toBeInTheDocument();
  },
};

export const LinePromo: Story = {
  args: {
    cart: [
      makeCartItem({
        name: "Promo",
        price: 3.33,
        quantity: 3,
        promotion: 10,
      }),
    ],
    globalPromotion: { type: "percent", value: 0 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const due = roundCurrency(3.33 * 3 * 0.9);
    await expect(canvas.getByText(formatCurrency(due))).toBeInTheDocument();
  },
};

export const GlobalPromo: Story = {
  args: {
    cart: globalPromoCart,
    globalPromotion: { type: "percent", value: 33 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(/Promotion globale \(33%\)/),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(`-${formatCurrency(1.98)}`),
    ).toBeInTheDocument();
    await expect(canvas.getByText(formatCurrency(4.02))).toBeInTheDocument();
  },
};

export const FloatThreeLines: Story = {
  args: {
    cart: floatThreeLinesCart,
    globalPromotion: { type: "percent", value: 0 },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(formatCurrency(0.9))).toBeInTheDocument();
  },
};
