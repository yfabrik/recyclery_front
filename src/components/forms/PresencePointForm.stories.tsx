import type { Meta, StoryObj } from '@storybook/react-vite';

import { PresencePointForm } from './PresencePointForm';

const meta = {
  component: PresencePointForm,
} satisfies Meta<typeof PresencePointForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    collectionPoints: [],
    stores: []
  }
};

export const MyStory = (args) => (
  <>
    <PresencePointForm {...args} />
    <button type="submit" form={args.formId}>
      Submit
    </button>
  </>
);

MyStory.args = {
  formId: "storybook-form",
  onSubmit:  (data) => {
      console.log(data);
    },
    collectionPoints: [{id:1,name:"aaa"}],
};