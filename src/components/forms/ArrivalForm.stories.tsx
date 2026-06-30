import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  mockCategories,
  mockCollectionPoints,
  noopSubmit,
} from "../../stories/fixtures";
import { ArrivalForm } from "./ArrivalForm";

const meta = {
  title: "Forms/ArrivalForm",
  component: ArrivalForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Records incoming stock by source type (collection point, voluntary drop-off, house clearance). Uses FormCategorySubcategoryFields and optional collection point select.",
      },
    },
  },
  args: {
    formId: "arrival-form",
    categories: mockCategories,
    collectionPoints: mockCollectionPoints,
    loading: false,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof ArrivalForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCollectionPoint: Story = {
  args: {
    defaultValues: {
      source_type: "point",
      collection_point_id: 1,
    },
  },
};

export const Prefilled: Story = {
  args: {
    defaultValues: {
      category_id: 1,
      subcategory_id: 11,
      weight: 12.5,
      source_type: "apport",
      source_details: "Don volontaire — famille Martin",
    },
  },
};
