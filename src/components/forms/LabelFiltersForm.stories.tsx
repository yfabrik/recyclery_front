import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockCategories } from "../../stories/fixtures";
import { LabelFiltersForm } from "./LabelFiltersForm";

const statusOptions = [
  { value: "available" as const, label: "Disponible", color: "success" as const },
  { value: "sold" as const, label: "Vendu", color: "default" as const },
  { value: "reserved" as const, label: "Réservé", color: "warning" as const },
];

const meta = {
  title: "Forms/LabelFiltersForm",
  component: LabelFiltersForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Labeled items list filters: category, search text, and status chip.",
      },
    },
  },
  args: {
    categories: mockCategories,
    statusOptions,
    defaultValues: {
      category_id: "",
      search: "",
      status: "",
    },
    onChange: (values: unknown) => console.log("[label filters]", values),
  },
} satisfies Meta<typeof LabelFiltersForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
