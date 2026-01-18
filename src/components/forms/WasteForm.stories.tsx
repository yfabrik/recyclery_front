import type { Meta, StoryObj } from '@storybook/react-vite';

import { WasteForm } from './WasteForm';

const meta = {
  component: WasteForm,
} satisfies Meta<typeof WasteForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    categories: [],
    subcategories: [],
    ecoOrganisms: [],
    onWeightFieldClick: () => {}
  }
};