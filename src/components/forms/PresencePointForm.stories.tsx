import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockCollectionPoints, noopSubmit } from "../../stories/fixtures";
import { PresencePointForm } from "./PresencePointForm";

const meta = {
  title: "Forms/PresencePointForm",
  component: PresencePointForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Schedules employee presence at a collection point for a given weekday and time range.",
      },
    },
  },
  args: {
    formId: "presence-point-form",
    defaultValues: {},
    collectionPoints: mockCollectionPoints,
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof PresencePointForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
