import type { Meta, StoryObj } from '@storybook/react-vite';

import { CardCollectionPoint } from './CardCollectionPoint';

const meta = {
  component: CardCollectionPoint,
} satisfies Meta<typeof CardCollectionPoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    point:
    {
      id: 2,
      name: "aaaa",
      address: "sdf",
      city: "sdf",
      postal_code: "12345",
      is_active: true,
      createdAt: "2026-02-06T12:55:01.898Z",
      updatedAt: "2026-02-06T12:55:01.898Z",
      recyclery_id: null,
      Recyclery: null,
      TaskSchedules: [
        {
          day_of_week: "Mardi",
          id: 5,
          is_recurring: true,
          recurrence_pattern: "weekly",
          name: "aaaa",
          description: null,
          category: "point",
          priority: null,
          required_skills: null,
          location: null,
          equipment_needed: null,
          hourly_rate: null,
          notes: "",
          status: null,
          scheduled_date: "2026-02-10T12:55:17.500Z",
          start_time: "2026-02-06T08:00:13.017Z",
          end_time: "2026-02-06T16:00:13.017Z",
          createdAt: "2026-02-06T12:55:17.507Z",
          updatedAt: "2026-02-06T12:55:17.507Z",
          collection_point_id: 2,
          store_id: null
        },
      ]
    }
  }
};