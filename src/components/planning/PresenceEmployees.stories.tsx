import type { Meta, StoryObj } from "@storybook/react-vite";
import type { EmployeeModel } from "../../interfaces/Models";
import { mockStores } from "../../stories/fixtures";
import { PrecenseEmployees } from "./PresenceEmployees";

const mockEmployee = (
  id: number,
  prenom: string,
  nom: string,
): EmployeeModel => ({
  id,
  createdAt: new Date().toISOString(),
  fullName: `${prenom} ${nom}`,
  nom,
  prenom,
  isActive: true,
});

const emptyEmployeesByDay = () => {
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
  const employeesByDay: Record<
    string,
    { label: string; morning: EmployeeModel[]; afternoon: EmployeeModel[]; allDay: EmployeeModel[] }
  > = {};
  daysOfWeek.forEach((day, index) => {
    employeesByDay[day] = {
      label: dayLabels[index],
      morning: [],
      afternoon: [],
      allDay: [],
    };
  });
  return employeesByDay;
};

const meta = {
  title: "Planning/PresenceEmployees",
  component: PrecenseEmployees,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Weekly employee presence grid (morning / afternoon / all day) for a selected store.",
      },
    },
  },
  args: {
    selectedStore: mockStores[0],
    onShowMissingEmployees: () => {},
    isLoading: false,
    employeesByDay: emptyEmployeesByDay(),
  },
} satisfies Meta<typeof PrecenseEmployees>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Populated: Story = {
  args: {
    employeesByDay: (() => {
      const schedule = emptyEmployeesByDay();
      schedule.monday.morning = [mockEmployee(1, "Marie", "Dupont")];
      schedule.monday.afternoon = [mockEmployee(2, "Jean", "Martin")];
      schedule.wednesday.allDay = [mockEmployee(3, "Sophie", "Bernard")];
      return schedule;
    })(),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
