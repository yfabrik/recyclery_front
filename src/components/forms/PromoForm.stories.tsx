import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { mockCategories, mockStores, noopSubmit } from "../../stories/fixtures";
import { PromoForm } from "./PromoForm";

const meta = {
  title: "Forms/PromoForm",
  component: PromoForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Promotion form: percentage discount on a category/subcategory, date range, active flag, and optional store multi-select.",
      },
    },
  },
  args: {
    formId: "promo-form",
    defaultValues: {},
    categories: mockCategories,
    stores: mockStores,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof PromoForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AllStores: Story = {
  args: {
    defaultValues: {
      category_id: 1,
      promotionValue: 20,
      isActive: true,
      stores: [""],
    },
  },
};

export const WithSubcategory: Story = {
  args: {
    defaultValues: {
      category_id: 1,
      subcategory_id: 12,
      promotionValue: 10,
      isActive: true,
      stores: [1],
    },
  },
};

export const SubmitWithNullEndDate: Story = {
  args: {
    onSubmit: fn((data: unknown) => data).mockName("onSubmit"),
    defaultValues: {
      category_id: 1,
      subcategory_id: "",
      promotionValue: 15,
      startDate: new Date("2026-01-15"),
      endDate: null,
      isActive: true,
      stores: [""],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: /Submit/i }));

    await expect(args.onSubmit).toHaveBeenCalled();
    const payload = args.onSubmit.mock.calls[0]?.[0] as {
      endDate: unknown;
      promotionValue: unknown;
    };
    expect(payload.endDate).toBeNull();
    expect(typeof payload.promotionValue).toBe("number");
    expect(payload.promotionValue).toBe(15);
  },
};
