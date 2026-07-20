import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockCategories } from "../../../stories/fixtures";
import { LabelFiltersForm } from "./LabelFiltersForm";

const meta = {
  title: "Forms/LabelFiltersForm",
  component: LabelFiltersForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Labeled items list filters: category, search text, status, and date range.",
      },
    },
  },
  args: {
    categories: mockCategories,
    defaultValues: {
      category_id: "",
      search: "",
      status: "",
      date_from: null,
      date_to: null,
    },
    onChange: (values: unknown) => console.log("[label filters]", values),
  },
} satisfies Meta<typeof LabelFiltersForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
