import type { Meta, StoryObj } from '@storybook/react-vite';

import { CollectionPointForm } from './CollectionPointForm';

const meta = {
  component: CollectionPointForm,
} satisfies Meta<typeof CollectionPointForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    onSubmit: {},
    recycleries: []
  }
};