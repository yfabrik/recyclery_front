import type { Meta, StoryObj } from "@storybook/react-vite";
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
