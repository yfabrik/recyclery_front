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
  updatedAt: new Date().toISOString(),
  fullName: `${prenom} ${nom}`,
  nom,
  prenom,
  phone: null,
  email: null,
  isActive: true,
});

const emptyEmployeesByDay = () => {
  const daysOfWeek = [
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
    { value: 0, label: "Dimanche" },
  ];
  const employeesByDay: Record<
    string,
    { label: string; morning: EmployeeModel[]; afternoon: EmployeeModel[]; allDay: EmployeeModel[] }
  > = {};
  daysOfWeek.forEach((day) => {
    employeesByDay[String(day.value)] = {
      label: day.label,
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
      schedule["1"].morning = [mockEmployee(1, "Marie", "Dupont")];
      schedule["1"].afternoon = [mockEmployee(2, "Jean", "Martin")];
      schedule["3"].allDay = [mockEmployee(3, "Sophie", "Bernard")];
      return schedule;
    })(),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
