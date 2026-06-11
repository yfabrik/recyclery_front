import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockCategories } from "../../stories/fixtures";
import { WasteFilterForm } from "./WasteFilterForm";

const today = new Date();

const meta = {
  title: "Forms/WasteFilterForm",
  component: WasteFilterForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Debounced waste disposal filters (category, disposal type, date range).",
      },
    },
  },
  args: {
    categories: mockCategories,
    defaultValues: {
      category_id: "",
      disposal_type: "",
      date_from: today,
      date_to: today,
    },
    onChange: (values: unknown) => console.log("[waste filters]", values),
  },
} satisfies Meta<typeof WasteFilterForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
