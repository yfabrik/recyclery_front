import type { Meta, StoryObj } from '@storybook/react-vite';

import { ManualItemForm } from './ManualItemForm';

const meta = {
  component: ManualItemForm,
} satisfies Meta<typeof ManualItemForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    formId: "formId",
    defaultValues: {},
    onSubmit: {},
    categories: [
    {
      "id": 1,
      "name": "aaa",
      "description": "erzerz",
      "icon": "",
      "createdAt": "2025-12-24T14:50:27.416Z",
      "updatedAt": "2026-01-05T14:39:54.220Z",
      "parent_id": null,
      "subcategories": [
        {
          "id": 7,
          "name": "dfsss",
          "description": "",
          "icon": "",
          "createdAt": "2026-01-05T14:45:05.592Z",
          "updatedAt": "2026-01-05T14:45:05.592Z",
          "parent_id": 1
        },
        {
          "id": 5,
          "name": "zaeaze",
          "description": "dddddddd",
          "icon": "",
          "createdAt": "2026-01-05T14:41:23.585Z",
          "updatedAt": "2026-01-05T14:45:14.429Z",
          "parent_id": 1
        }
      ]
    },
    {
      "id": 2,
      "name": "aaaa",
      "description": "",
      "icon": "",
      "createdAt": "2025-12-24T14:50:56.635Z",
      "updatedAt": "2025-12-24T14:50:56.635Z",
      "parent_id": null,
      "subcategories": []
    },
    {
      "id": 3,
      "name": "gdfg",
      "description": "fdgdfg",
      "icon": "Create",
      "createdAt": "2026-01-05T14:09:13.061Z",
      "updatedAt": "2026-01-05T14:09:13.061Z",
      "parent_id": null,
      "subcategories": [{
          "id": 52,
          "name": "zzzzzzzzz",
          "description": "dddddddd",
          "icon": "",
          "createdAt": "2026-01-05T14:41:23.585Z",
          "updatedAt": "2026-01-05T14:45:14.429Z",
          "parent_id": 3
        },
      {
          "id": 53,
          "name": "zaeaze",
          "description": "aze",
          "icon": "",
          "createdAt": "2026-01-05T14:41:23.585Z",
          "updatedAt": "2026-01-05T14:45:14.429Z",
          "parent_id": 3
        }]
    },
    {
      "id": 4,
      "name": "zaeaz",
      "description": "",
      "icon": "",
      "createdAt": "2026-01-05T14:10:42.024Z",
      "updatedAt": "2026-01-05T14:10:42.024Z",
      "parent_id": null,
      "subcategories": []
    },
    {
      "id": 6,
      "name": "fgdfg",
      "description": "",
      "icon": "",
      "createdAt": "2026-01-05T14:44:52.323Z",
      "updatedAt": "2026-01-05T14:44:52.323Z",
      "parent_id": null,
      "subcategories": []
    }
  ],
    OpenKeypad: () => {}
  }
};