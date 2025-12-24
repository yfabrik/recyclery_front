import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmployeeForm } from './EmployeeForm';

const meta = {
  component: EmployeeForm,
} satisfies Meta<typeof EmployeeForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userDialog: true,
    editingUser: true,
    handleCloseUserDialog: () => {},
    stores: [{id:1,name:"test"},{id:2,name:"test2"}],
    roles: [{name:"a",display_name:"aa"},{name:"b",display_name:"bb"}]
  }
};