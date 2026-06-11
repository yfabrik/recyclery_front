import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  mockCategories,
  mockEcoOrganisms,
  noopSubmit,
} from "../../stories/fixtures";
import { WasteForm } from "./WasteForm";

const meta = {
  title: "Forms/WasteForm",
  component: WasteForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Records waste disposal (eco-organism, landfill, other). Eco-organism mode requires selecting an eco-organism partner.",
      },
    },
  },
  args: {
    formId: "waste-form",
    defaultValues: {},
    categories: mockCategories,
    ecoOrganisms: mockEcoOrganisms,
    onSubmit: noopSubmit,
    onWeightFieldClick: () => {},
  },
} satisfies Meta<typeof WasteForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EcoOrganism: Story = {
  args: {
    defaultValues: {
      disposal_type: "eco_organism",
      category_id: 3,
      subcategory_id: 31,
      eco_organism_id: 1,
      weight_kg: 120,
    },
  },
};

export const Landfill: Story = {
  args: {
    defaultValues: {
      disposal_type: "landfill",
      category_id: 2,
      weight_kg: 45,
      notes: "Déchets non valorisables",
    },
  },
};
