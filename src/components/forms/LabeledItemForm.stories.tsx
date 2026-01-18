import type { Meta, StoryObj } from '@storybook/react-vite';

import { LabeledItemForm } from './LabeledItemForm';

const meta = {
  component: LabeledItemForm,
} satisfies Meta<typeof LabeledItemForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    categories: [],
    setShowWeightKeypad: () => {},
    setShowPriceKeypad: () => {}
  }
};