import type { Meta, StoryObj } from '@storybook/react-vite';

import { CategorieForm } from './CategorieForm';

const meta = {
  component: CategorieForm,
} satisfies Meta<typeof CategorieForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    icons: []
  }
};