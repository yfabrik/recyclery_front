import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { MuiIconSelect } from "./MuiIconSelect";

const iconNames = [
  "Category",
  "LocalLaundryService",
  "Chair",
  "Computer",
  "Checkroom",
  "Book",
  "Toys",
  "Kitchen",
  "Home",
  "Bed",
  "Create",
  "Build",
];

const meta = {
  title: "Components/MuiIconSelect",
  component: MuiIconSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Searchable MUI icon picker used in category and task forms.",
      },
    },
  },
  args: {
    value: null,
    onChange: () => {},
  },
} satisfies Meta<typeof MuiIconSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>("Book");
    return (
      <MuiIconSelect
        value={value}
        onChange={setValue}
        TextFieldProps={{ label: "Icône", fullWidth: true }}
        iconNames={iconNames}
      />
    );
  },
};

export const Unselected: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);
    return (
      <MuiIconSelect
        value={value}
        onChange={setValue}
        TextFieldProps={{ label: "Choisir une icône" }}
        iconNames={iconNames}
      />
    );
  },
};
