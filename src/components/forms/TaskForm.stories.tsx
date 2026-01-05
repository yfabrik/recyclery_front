import type { Meta, StoryObj } from "@storybook/react-vite";

import { TaskForm } from "./TaskForm";

const meta = {
  component: TaskForm,
} satisfies Meta<typeof TaskForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "form1",
    employees: [],
    onSubmit: (data) => {
      console.log(data);
    },
  },
};

export const MyStory = (args) => (
  <>
    <TaskForm {...args} />
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
};