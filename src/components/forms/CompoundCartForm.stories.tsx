import type { Meta, StoryObj } from '@storybook/react-vite';

import { CompoundCartForm } from './CompoundCartForm';

const meta = {
  component: CompoundCartForm,
} satisfies Meta<typeof CompoundCartForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    categories: [],
    handleSale: () => { }
  }
};