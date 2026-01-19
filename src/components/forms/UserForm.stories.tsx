import type { Meta, StoryObj } from '@storybook/react-vite';

import { UserForm } from './UserForm';

const meta = {
  component: UserForm,
} satisfies Meta<typeof UserForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    stores: [],
    roles: []
  }
};