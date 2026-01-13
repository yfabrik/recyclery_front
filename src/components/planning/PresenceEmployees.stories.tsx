import type { Meta, StoryObj } from '@storybook/react-vite';

import { PrecenseEmployees } from './PresenceEmployees';

const meta = {
  component: PrecenseEmployees,
} satisfies Meta<typeof PrecenseEmployees>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args:{
    getEmployeesByDay() {
    const daysOfWeek = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayLabels = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];

    const employeesByDay = {};

    daysOfWeek.forEach((day, index) => {
      employeesByDay[day] = {
        label: dayLabels[index],
        morning: [],
        afternoon: [],
        allDay: [],
      };
    });
    return employeesByDay
    },
  }
};