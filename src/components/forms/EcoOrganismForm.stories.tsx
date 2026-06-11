import type { Meta, StoryObj } from "@storybook/react-vite";
import { noopSubmit } from "../../stories/fixtures";
import { EcoOrganismForm } from "./EcoOrganismForm";

const meta = {
  title: "Forms/EcoOrganismForm",
  component: EcoOrganismForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: "Eco-organism partner contact and status form.",
      },
    },
  },
  args: {
    formId: "eco-organism-form",
    onSubmit: noopSubmit,
  },
} satisfies Meta<typeof EcoOrganismForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
