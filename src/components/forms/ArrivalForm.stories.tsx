import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrivalForm } from "./ArrivalForm";

const meta = {
  component: ArrivalForm,
  args: {
    categories: [
      {
        id: 1,
        name: "aaa",
        description: "",
        icon: "",
        createdAt: "2025-12-24T14:50:27.416Z",
        updatedAt: "2025-12-24T14:50:27.416Z",
        parent_id: null,
      },
      {
        id: 2,
        name: "aaaa",
        description: "",
        icon: "",
        createdAt: "2025-12-24T14:50:56.635Z",
        updatedAt: "2025-12-24T14:50:56.635Z",
        parent_id: null,
      },
    ],
    collectionPoints: [],
    onSubmit: (data) => console.log(data)
  },
} satisfies Meta<typeof ArrivalForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {

};
