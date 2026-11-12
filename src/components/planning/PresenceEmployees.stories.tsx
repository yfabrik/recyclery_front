import type { Meta, StoryObj } from "@storybook/react-vite";
import { isoDateSchema } from "@recyclerie/api/primitives/zod";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { EmployeeModel } from "../../interfaces/Models";
import { mockStores } from "../../stories/fixtures";
import { weekMarkersByWeekday, type MarkerTask } from "../../services/planning/weekTaskMarkers";
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

// ----------------------------------------------------------------------------
// Task count pills and Vacation conflict markers
// ----------------------------------------------------------------------------

const weekTask = (id: number, day: string, employeeIds: number[]): MarkerTask => ({
  id,
  scheduled_date: `${day}T00:00:00.000Z`,
  Employees: employeeIds.map((employeeId) => ({ id: employeeId })),
});

/** Monday: Marie (morning) holds 3 Tasks, Jean (afternoon) none. Thursday: Sophie (all day), Lucas (afternoon), Jean (morning). */
const markerSchedule = () => {
  const schedule = emptyEmployeesByDay();
  schedule["1"].morning = [mockEmployee(1, "Marie", "Dupont")];
  schedule["1"].afternoon = [mockEmployee(2, "Jean", "Martin")];
  schedule["4"].allDay = [mockEmployee(3, "Sophie", "Bernard")];
  schedule["4"].morning = [mockEmployee(2, "Jean", "Martin")];
  schedule["4"].afternoon = [mockEmployee(4, "Lucas", "Petit")];
  return schedule;
};

const MARKER_TASKS: MarkerTask[] = [
  weekTask(1, "2026-01-12", [1]),
  weekTask(2, "2026-01-12", [1]),
  weekTask(3, "2026-01-12", [1]),
  weekTask(4, "2026-01-15", [3]),
  weekTask(5, "2026-01-15", [3, 4]),
];

const voirLesTaches = (name: string, day: string) =>
  new RegExp(`^Voir les tâches de ${name} le ${day}`);

/**
 * Employees with Tasks show a blue pill with their number of distinct Tasks that day, none
 * at zero. Jean is on Vacation on Thursday without a Task: greyed as before, no red marker,
 * no conflict chip anywhere.
 */
export const WithoutConflict: Story = {
  args: {
    employeesByDay: markerSchedule(),
    vacationEmployeeIdsByDay: { 4: new Set([2]) },
    markersByDay: weekMarkersByWeekday({
      tasks: MARKER_TASKS.slice(0, 3),
      weekStart: WEEK_START,
      vacationEmployeeIdsByDay: { 4: new Set([2]) },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const marie = within(canvas.getByRole("button", { name: voirLesTaches("Marie Dupont", "lundi") }));
    await expect(marie.getByRole("img", { name: "3 tâches ce jour" })).toHaveTextContent("3");

    const jeanMonday = canvas.getByRole("button", { name: voirLesTaches("Jean Martin", "lundi") });
    await expect(within(jeanMonday).queryByRole("img")).not.toBeInTheDocument();

    const jeanOnVacation = canvas.getByRole("button", { name: voirLesTaches("Jean Martin", "jeudi") });
    await expect(within(jeanOnVacation).queryByRole("img")).not.toBeInTheDocument();
    await expect(jeanOnVacation).not.toHaveStyle({ backgroundColor: "rgb(255, 235, 238)" });

    await expect(canvas.queryByText(/conflit/)).not.toBeInTheDocument();
  },
};

/**
 * Sophie (2 Tasks) and Lucas (1 Task) are on Vacation on Thursday and still hold Tasks: a red
 * badge with its tooltip and a red row on each, and the Thursday card announces "2 conflits".
 * Jean, on Vacation the same day without a Task, gets no red marker. Marie keeps her pill.
 */
export const WithVacationConflict: Story = {
  args: {
    employeesByDay: markerSchedule(),
    vacationEmployeeIdsByDay: { 4: new Set([2, 3, 4]) },
    markersByDay: weekMarkersByWeekday({
      tasks: MARKER_TASKS,
      weekStart: WEEK_START,
      vacationEmployeeIdsByDay: { 4: new Set([2, 3, 4]) },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByText("2 conflits")).toBeInTheDocument();
    await expect(canvas.getAllByText(/conflit/)).toHaveLength(1);

    const sophieButton = canvas.getByRole("button", { name: voirLesTaches("Sophie Bernard", "jeudi") });
    const sophie = within(sophieButton);
    const badge = sophie.getByRole("img", { name: "En congé mais assigné à 2 tâches" });
    await expect(sophie.getByRole("img", { name: "2 tâches ce jour" })).toBeInTheDocument();
    await expect(sophieButton).toHaveStyle({ backgroundColor: "rgb(255, 235, 238)" });

    await userEvent.hover(badge);
    await expect(await body.findByRole("tooltip")).toHaveTextContent("En congé mais assigné à 2 tâches");
    await userEvent.unhover(badge);
    await waitFor(() => expect(body.queryByRole("tooltip")).not.toBeInTheDocument());

    const lucasButton = canvas.getByRole("button", { name: voirLesTaches("Lucas Petit", "jeudi") });
    await expect(
      within(lucasButton).getByRole("img", { name: "En congé mais assigné à 1 tâche" }),
    ).toBeInTheDocument();
    await expect(lucasButton).toHaveStyle({ backgroundColor: "rgb(255, 235, 238)" });

    const jeanButton = canvas.getByRole("button", { name: voirLesTaches("Jean Martin", "jeudi") });
    await expect(within(jeanButton).queryByRole("img")).not.toBeInTheDocument();
    await expect(jeanButton).not.toHaveStyle({ backgroundColor: "rgb(255, 235, 238)" });

    // Marie is not on Vacation: a pill, no conflict.
    const marie = within(canvas.getByRole("button", { name: voirLesTaches("Marie Dupont", "lundi") }));
    await expect(marie.getByRole("img", { name: "3 tâches ce jour" })).toBeInTheDocument();
    await expect(marie.queryByRole("img", { name: /En congé/ })).not.toBeInTheDocument();
  },
};

/**
 * The chip counts Employees: one Employee on Vacation listed in both the morning and the
 * afternoon section of the day (two badges, the same markers on each) is one conflict.
 */
export const ConflictOfAnEmployeeListedTwice: Story = {
  args: {
    employeesByDay: (() => {
      const schedule = emptyEmployeesByDay();
      schedule["4"].morning = [mockEmployee(3, "Sophie", "Bernard")];
      schedule["4"].afternoon = [mockEmployee(3, "Sophie", "Bernard")];
      return schedule;
    })(),
    vacationEmployeeIdsByDay: { 4: new Set([3]) },
    markersByDay: weekMarkersByWeekday({
      tasks: MARKER_TASKS,
      weekStart: WEEK_START,
      vacationEmployeeIdsByDay: { 4: new Set([3]) },
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const badges = canvas.getAllByRole("button", { name: voirLesTaches("Sophie Bernard", "jeudi") });
    await expect(badges).toHaveLength(2);
    for (const badge of badges) {
      await expect(
        within(badge).getByRole("img", { name: "En congé mais assigné à 2 tâches" }),
      ).toBeInTheDocument();
    }
    await expect(canvas.getByText("1 conflit")).toBeInTheDocument();
  },
};
