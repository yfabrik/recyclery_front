/**
 * Stories for the Employee day dialog, wired to `GET /api/employees/:id/tasks`.
 * Axios is monkey-patched per story with a tiny in-memory server (`stories/fakeAxios`), so
 * these run the real service, query hook and components, not a mock. The day is Thursday
 * 2026-01-15; fixtures live in `stories/fixtures/employeeDay`.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import { useEffect, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { Employee } from "../../employee";
import { apiError, installFakeServer, ok, restoreAxios } from "../../stories/fakeAxios";
import {
  DAY,
  EMPLOYEES,
  emptyDay,
  inesOnVacationDay,
  karimDay,
  leaDay,
  marcDay,
  sophieDay,
} from "../../stories/fixtures/employeeDay";
import { EmployeeDayDialog } from "./EmployeeDayDialog";

/** MUI's Dialog portals to `document.body`; locate it there, then scope queries to it. */
const dialogScreen = (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);
  return within(body.getByRole("dialog"));
};

interface StoryWrapperProps {
  employee: Employee;
  /** What the server answers for that Employee's day. */
  day: EmployeeTasksDayDto;
  /** The server answers every request with this error instead. */
  failWith?: { status: number; message: string };
  /** Called with the URL and query params of each employee-tasks request. */
  onRequest?: (url: string, params: unknown) => void;
}

function StoryWrapper({ employee, day, failWith, onRequest }: StoryWrapperProps) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  // Installed synchronously during the first render: see `stories/fakeAxios`.
  useState(() => {
    installFakeServer({
      get: (url, config) => {
        if (url !== `/api/employees/${employee.id}/tasks`) {
          return Promise.reject(new Error(`Unhandled GET ${url}`));
        }
        onRequest?.(url, config?.params);
        if (failWith) return apiError(failWith.status, failWith.message);
        return ok({ employee_id: employee.id, days: [day] });
      },
    });
    return null;
  });
  useEffect(() => restoreAxios, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EmployeeDayDialog open onClose={fn()} employee={employee} date={DAY} />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Planning/EmployeeDayDialog",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Real dialog wired to `GET /api/employees/:id/tasks` with axios mocked per story. Read-only: assigned Tasks (with the Employee's Time ranges) on the left, assignable and unavailable Tasks on the right, work hours and Time ranges on the day strip.",
      },
    },
  },
  args: {
    employee: EMPLOYEES.lea,
    day: leaDay,
    onRequest: fn(),
  },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Léa works 08:00-16:00 and holds two Tasks (two Time ranges on the first); one Task is
 * still free. The request carries the day only: no Store parameter.
 */
export const AssignedTasks: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await expect(screen.getByRole("heading", { name: "Léa Martin" })).toBeInTheDocument();
    await expect(screen.getByText("jeudi 15 janvier")).toBeInTheDocument();
    await expect(
      within(screen.getByRole("group", { name: "Horaires de travail" })).getByText("08:00–16:00"),
    ).toBeInTheDocument();

    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Tri arrivage")).toBeInTheDocument();
    await expect(assigned.getByText("08:00–11:00 · Magasin centre")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 08:30–09:30")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 2 · 10:00–11:00")).toBeInTheDocument();
    await expect(assigned.getByText("Vente atelier")).toBeInTheDocument();
    await expect(assigned.getByText("13:00–16:00 · Magasin nord")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 13:00–15:00")).toBeInTheDocument();

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getByText("Collecte")).toBeInTheDocument();
    await expect(assignable.getByText("Libre 11:00–13:00")).toBeInTheDocument();
    await expect(assignable.queryByText("Tri arrivage")).not.toBeInTheDocument();

    const strip = within(screen.getByRole("group", { name: "Journée de Léa Martin" }));
    await expect(strip.getByText("Journée de l'employé — 4 h assignées sur 8 h de présence")).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Horaires de travail 08:00–16:00" })).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Tri arrivage · 08:30–09:30" })).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Tri arrivage · 10:00–11:00" })).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Vente atelier · 13:00–15:00" })).toBeInTheDocument();

    await expect(args.onRequest).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledWith("/api/employees/1/tasks", {
      date_from: DAY,
      date_to: DAY,
    });
  },
};

/** Sophie only works in the afternoon: the morning Tasks are out of hours, nothing is assigned. */
export const HalfDayOutsideHours: Story = {
  args: { employee: EMPLOYEES.sophie, day: sophieDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (0)" })).toBeInTheDocument();
    await expect(
      within(screen.getByRole("group", { name: "Horaires de travail" })).getByText("13:00–17:00"),
    ).toBeInTheDocument();

    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Aucune tâche assignée")).toBeInTheDocument();

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getAllByText("Hors de ses horaires de travail")).toHaveLength(2);
    await expect(assignable.getAllByText("Impossible")).toHaveLength(2);
    await expect(assignable.getByText("Libre 13:00–16:00")).toBeInTheDocument();
    await expect(assignable.getByText("Libre")).toBeInTheDocument();
  },
};

/** Karim holds "Tri textile" 09:00-12:00, so "Tri arrivage" is busy for him; "Vente atelier" is free. */
export const BusyOnAnotherTask: Story = {
  args: { employee: EMPLOYEES.karim, day: karimDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Tri textile")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 09:00–12:00")).toBeInTheDocument();

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getByText("Tri arrivage")).toBeInTheDocument();
    await expect(assignable.getByText("Déjà sur « Tri textile »")).toBeInTheDocument();
    await expect(assignable.getByText("Impossible")).toBeInTheDocument();
    await expect(assignable.getByText("Vente atelier")).toBeInTheDocument();
    await expect(assignable.getByText("Libre 13:00–16:00")).toBeInTheDocument();
  },
};

/** An Employee with no Workday and no Task that day. */
export const EmptyDay: Story = {
  args: { employee: EMPLOYEES.marc, day: emptyDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByText("Aucune tâche planifiée ce jour")).toBeInTheDocument();
    await expect(screen.getByText("Ne travaille pas ce jour")).toBeInTheDocument();
    await expect(screen.queryByRole("heading", { name: /Tâches assignées/ })).not.toBeInTheDocument();
    await expect(screen.queryByRole("heading", { name: "Tâches assignables" })).not.toBeInTheDocument();
  },
};

/** Marc holds every Task of the day: the assignable column is empty. */
export const NothingAssignable: Story = {
  args: { employee: EMPLOYEES.marc, day: marcDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await expect(screen.getByText("Aucune autre tâche ce jour")).toBeInTheDocument();
  },
};

/**
 * Inès is on Vacation and holds nothing: an info alert gives the reason and says no Task can
 * be assigned; every Task of the day is unavailable for the same reason.
 */
export const OnVacationNothingAssigned: Story = {
  args: { employee: EMPLOYEES.ines, day: inesOnVacationDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (0)" })).toBeInTheDocument();
    await expect(screen.getByRole("alert")).toHaveTextContent(
      "En congé (Congé payé) : aucune tâche ne peut lui être assignée.",
    );

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getAllByText("En congé")).toHaveLength(3);
    await expect(assignable.getAllByText("Impossible")).toHaveLength(3);
    await expect(assignable.queryByText(/^Libre/)).not.toBeInTheDocument();
  },
};

/** The server refuses the request: the dialog shows the API message and lets the user retry. */
export const LoadError: Story = {
  args: { failWith: { status: 500, message: "Erreur serveur" } },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("alert")).toHaveTextContent("Erreur serveur");
    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    await waitFor(() => expect(args.onRequest).toHaveBeenCalledTimes(2));
  },
};
