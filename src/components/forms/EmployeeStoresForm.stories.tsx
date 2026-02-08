import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmployeeStoresForm } from './EmployeeStoresForm';

const meta = {
  component: EmployeeStoresForm,
} satisfies Meta<typeof EmployeeStoresForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    stores: [{ id: 1, name: "aaa" }, { id: 2, name: "bbbb" }]
  }
};