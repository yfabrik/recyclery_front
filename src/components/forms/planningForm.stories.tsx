import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlaningForm } from './planningForm';

const meta = {
  component: PlaningForm,
} satisfies Meta<typeof PlaningForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    tasks: [],
    priorityOptions: [],
    stores: [],
    locations: []
  }
};