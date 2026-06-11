import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockCategories, noopSubmit } from "../../stories/fixtures";
import { ManualItemForm } from "./ManualItemForm";

const meta = {
  title: "Forms/ManualItemForm",
  component: ManualItemForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "POS manual sale line with weight/price prompts (usePrompt). Category defaults can pre-fill weight and price.",
      },
    },
  },
  args: {
    formId: "manual-item-form",
    defaultValues: {},
    categories: mockCategories,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof ManualItemForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubcategory: Story = {
  args: {
    defaultValues: {
      category_id: 1,
      subcategory_id: 11,
    },
  },
};

export const WithPromotion: Story = {
  args: {
    defaultValues: {
      category_id: 1,
      subcategory_id: 11,
      weight: 2,
      price: 10,
      promotion: 15,
      description: "Article en promo",
    },
  },
};
