import type { Meta, StoryObj } from '@storybook/react-vite';

import { CategoryDialog } from './categorieDialog';

const meta = {
  component: CategoryDialog,
} satisfies Meta<typeof CategoryDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    openDialog: true,
    editingCategory: {},
    handleCloseDialog: {},
    onSubmit: (data)=>console.log(data),
    categories: [],
    availableIcons: []
  }
};