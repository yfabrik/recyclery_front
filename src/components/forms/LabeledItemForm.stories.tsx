import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockCategories, noopSubmit } from "../../stories/fixtures";
import { LabeledItemForm } from "./LabeledItemForm";

const meta = {
  title: "Forms/LabeledItemForm",
  component: LabeledItemForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Creates a labeled item with condition, location, and optional auto-print. Weight/price prompts use category defaults.",
      },
    },
  },
  args: {
    formId: "labeled-item-form",
    defaultValues: {},
    categories: mockCategories,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof LabeledItemForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Prefilled: Story = {
  args: {
    defaultValues: {
      category_id: 2,
      weight: 0.3,
      price: 2,
      condition_state: "good",
      location: "Rayon A3",
      description: "Roman policier",
    },
  },
};

export const WithSubcategory: Story = {
  args: {
    defaultValues: {
      category_id: 3,
      subcategory_id: 31,
      weight: 8,
      price: 30,
      condition_state: "fair",
    },
  },
};
