import type { Meta, StoryObj } from '@storybook/react-vite';

import { StoreForm } from './StoreForm';

const meta = {
  component: StoreForm,
} satisfies Meta<typeof StoreForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    onSubmit: {},
    users: []
  }
};