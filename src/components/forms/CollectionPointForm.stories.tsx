import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockStores, noopSubmit } from "../../stories/fixtures";
import { CollectionPointForm } from "./CollectionPointForm";

const meta = {
  title: "Forms/CollectionPointForm",
  component: CollectionPointForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Create or edit a collection point linked to a store (recyclery).",
      },
    },
  },
  args: {
    formId: "collection-point-form",
    onSubmit: noopSubmit,
    recycleries: mockStores,
  },
} satisfies Meta<typeof CollectionPointForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
