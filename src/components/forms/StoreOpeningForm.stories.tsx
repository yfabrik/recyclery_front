import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockStores, noopSubmit } from "../../stories/fixtures";
import { StoreOpeningForm } from "./StoreOpeningForm";

const meta = {
  title: "Forms/StoreOpeningForm",
  component: StoreOpeningForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Store opening hours schedule form.",
      },
    },
  },
  args: {
    formId: "store-opening-form",
    defaultValues: {},
    onSubmit: noopSubmit,
    stores: mockStores,
  },
} satisfies Meta<typeof StoreOpeningForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
