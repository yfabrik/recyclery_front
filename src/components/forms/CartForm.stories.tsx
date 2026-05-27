import type { Meta, StoryObj } from '@storybook/react-vite';

import { CartForm } from './CartForm';

const meta = {
  component: CartForm,
} satisfies Meta<typeof CartForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {}
  }
};