import type { Meta, StoryObj } from '@storybook/react-vite';

import { EcoOrganismForm } from './EcoOrganismForm';

const meta = {
  component: EcoOrganismForm,
} satisfies Meta<typeof EcoOrganismForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    onSubmit: {}
  }
};