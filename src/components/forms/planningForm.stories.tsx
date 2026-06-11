import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockStores, noopSubmit } from "../../stories/fixtures";
import { PlaningForm } from "./planningForm";

const meta = {
  title: "Forms/PlaningForm",
  component: PlaningForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Planning task create/edit form with store, location, and priority options.",
      },
    },
  },
  args: {
    formId: "planning-form",
    defaultValues: {},
    onSubmit: noopSubmit,
    stores: mockStores.map(({ id, name }) => ({ id, name })),
  },
} satisfies Meta<typeof PlaningForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
