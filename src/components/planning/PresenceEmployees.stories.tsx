import type { Meta, StoryObj } from "@storybook/react-vite";
import { isoDateSchema } from "@recyclerie/api/primitives/zod";
import { expect, fn, userEvent, within } from "storybook/test";
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

/** Monday of the displayed week: the cards only know their weekday. */
const WEEK_START = isoDateSchema("date").parse("2026-01-12");

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
    vacationEmployeeIdsByDay: {},
    weekStart: WEEK_START,
    onSelectEmployee: fn(),
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

/**
 * Each Employee name is a button; its label names the Employee and the day, and the
 * handler receives the date of the clicked card (Monday + weekday index, Sunday last).
 */
export const SelectEmployee: Story = {
  args: {
    employeesByDay: (() => {
      const schedule = emptyEmployeesByDay();
      schedule["1"].morning = [mockEmployee(1, "Marie", "Dupont")];
      schedule["4"].allDay = [mockEmployee(3, "Sophie", "Bernard")];
      schedule["0"].afternoon = [mockEmployee(2, "Jean", "Martin")];
      return schedule;
    })(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Voir les tâches de Marie Dupont le lundi 12 janvier" }));
    await expect(args.onSelectEmployee).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 1 }),
      "2026-01-12",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Voir les tâches de Sophie Bernard le jeudi 15 janvier" }));
    await expect(args.onSelectEmployee).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 3 }),
      "2026-01-15",
    );

    await userEvent.click(canvas.getByRole("button", { name: "Voir les tâches de Jean Martin le dimanche 18 janvier" }));
    await expect(args.onSelectEmployee).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 2 }),
      "2026-01-18",
    );
  },
};
