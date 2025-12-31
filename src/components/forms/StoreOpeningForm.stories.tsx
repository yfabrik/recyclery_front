import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoreOpeningForm } from './StoreOpeningForm';

const meta = {
  component: StoreOpeningForm,
} satisfies Meta<typeof StoreOpeningForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    stores: []
  }
};