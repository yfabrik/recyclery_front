import type { Meta, StoryObj } from '@storybook/react-vite';

import { EmployeeWorkdaysForm } from './EmployeeWorkdaysForm';

const meta = {
  component: EmployeeWorkdaysForm,
} satisfies Meta<typeof EmployeeWorkdaysForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};