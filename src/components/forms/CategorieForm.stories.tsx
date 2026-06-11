import type { Meta, StoryObj } from "@storybook/react-vite";
import { noopSubmit } from "../../stories/fixtures";
import { CategorieForm } from "./CategorieForm";

const categoryIcons = [
  "Tv",
  "Watch",
  "Camera",
  "Headphones",
  "SportsEsports",
  "DirectionsBike",
  "DirectionsCar",
  "Home",
  "Bed",
];

const meta = {
  title: "Forms/CategorieForm",
  component: CategorieForm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Category create/edit form with icon picker, default weight/price, and bundle pricing.",
      },
    },
  },
  args: {
    formId: "categorie-form",
    defaultValues: {},
    onSubmit: noopSubmit,
    icons: categoryIcons,
  },
} satisfies Meta<typeof CategorieForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
